require("dotenv").config();
const path = require("path");

const express = require("express");
const app = express();
app.use(express.json());

app.use(express.urlencoded({extended:true}));
const session = require('express-session');

const { createServer } = require("http");
const { Server } = require("socket.io");
app.set("trust proxy", 1); // trust first proxy
const server = createServer(app);
const io = new Server(server);

const sessionMiddleware = session({
  secret: process.env.PASS,
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, 
  }
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

const bcrypt = require("bcrypt");
const saltRounds = 10;
const { body } = require('express-validator');

const db = require("./db")

const port = process.env.PORT;

app.use(express.static(path.join(__dirname, "../client/dist"))); 







/* ----   Socket.io   &   Rooms   ---- */

io.on("connection", (socket) => {
  const theSession = socket.request.session

  // Get my rooms 
  socket.on("reqMyRooms", async ()=>{
    const userId = theSession.userId;
    const rooms_result = await db.query(`
      SELECT 
        r.room_id,
        r.room_name,
        r.room_description,
        r.admin_id,
        r.created_at,
        
        a.user_name as admin_name,
        a.user_email as admin_email,
        
        u.user_id as member_id,
        u.user_name as member_name,
        u.user_email as member_email
      FROM rooms r
      JOIN room_members rm ON r.room_id = rm.room_id
      JOIN users u ON rm.user_id = u.user_id
      JOIN users a ON r.admin_id = a.user_id
      WHERE r.room_id IN (SELECT room_id FROM room_members WHERE user_id = $1)
      ORDER BY r.room_name, u.user_name
    ;`, [userId])

    if(rooms_result.rows.length === 0){ 
      return socket.emit("roomInfo", {status: false, error: "Getting room error!"}) 
    }

    const roomsMap = {}
    rooms_result.rows.forEach(
      row =>{ 
        if (!roomsMap[row.room_id]) {
          roomsMap[row.room_id] = {
            room_id: row.room_id,
            room_name: row.room_name,
            room_description: row.room_description,
            admin: {
              user_id: row.admin_id,
              user_name: row.admin_name,
              user_email: row.admin_email
            },
            members: []
          }
        }
        roomsMap[row.room_id].members.push({
          user_id: row.member_id,
          user_name: row.member_name,
          user_email: row.member_email
        })

      }
    )
    socket.emit("resMyRooms", Object.values(roomsMap))
  })

  // Update my room
  socket.on("updateRoom", async (req) => {
    try {
      const { roomId, roomName, roomDescription, roomAdminEmail, members } = req;
      const userId = theSession.userId;

      const checkAdmin = await db.query(`
          SELECT admin_id 
            FROM rooms
            WHERE room_id = $1
      `, [roomId]);
      const isAdmin = (checkAdmin.rows[0]?.admin_id === userId)

      if(isAdmin){
        const roomUpdate = await db.query(`
          UPDATE rooms
            SET room_name = $2,
              admin_id = (SELECT user_id FROM users WHERE user_email = $3),
              room_description = $4
            WHERE room_id = $1
        `, [roomId, roomName, roomAdminEmail, roomDescription]);

        if(!members.includes((m)=>m===roomAdminEmail)){
          members.push(roomAdminEmail)
        }

        await db.query(`
          DELETE FROM room_members
            WHERE room_id = $1 AND user_id NOT IN (SELECT user_id FROM users WHERE user_email = ANY($2))
        `, [roomId, members]);

        await db.query(`
          INSERT INTO room_members (room_id, user_id)
            SELECT $1, user_id FROM users WHERE user_email = ANY($2)
            ON CONFLICT (room_id, user_id) DO NOTHING
        `, [roomId, members]);
        socket.emit("error", "Room updated!")
      } else {
        socket.emit("error", "You are not the admin of this room")
      }

      const roomInfo = await db.query(`
          SELECT r.room_id, r.room_name, r.room_description, r.admin_id, u.user_name as admin_name, u.user_email as admin_email
          FROM rooms r
          JOIN users u ON r.admin_id = u.user_id
          WHERE r.room_id = $1
      `, [roomId]);

      const memberList = await db.query(`
          SELECT rm.user_id, u.user_name as member_name, u.user_email
          FROM room_members rm
          JOIN users u ON rm.user_id = u.user_id
          WHERE rm.room_id = $1
      `, [roomId]);

      socket.emit("newRoom", {
        newRoom: {
            room_id: roomInfo.rows[0].room_id,
            room_name: roomInfo.rows[0].room_name,
            room_description: roomInfo.rows[0].room_description,
            admin: {
                user_id: roomInfo.rows[0].admin_id,
                user_name: roomInfo.rows[0].admin_name,
                user_email: roomInfo.rows[0].admin_email
            }
        },
        newMembers: memberList.rows.map(row => ({
            user_id: row.user_id,
            user_name: row.member_name,
            user_email: row.user_email
        }))
      });


    } catch (err) {
        console.log("UpdateRoom Error: ", err);
    }
  });

  // Remove Room Access
  socket.on("removeRoomAccess", async (roomId) => {
    try {
      const userId = theSession.userId;
      await db.query(`
        DELETE FROM room_members 
          WHERE room_id = $1 AND user_id = $2
      `, [roomId, userId]);
      socket.emit("removedAccess", roomId)
      socket.emit("error", "Your access have been removed!")
    } catch (err) {
        console.log("UpdateRoom Error: ", err);
    }
  });

  // Create Room
  socket.on("creRoom", async (reqRoom)=>{
    try{
      const roomName = reqRoom.roomName;
      const emails = reqRoom.users;
      const roomDesc = reqRoom.roomDescription || "A new room!"
      const adminId = theSession.userId;
      const toAddUsers = []
      toAddUsers.push(adminId) 

      for (const u of emails){
        const userFound = await db.query(
          "SELECT user_id FROM users WHERE user_email = $1",
          [u]
        )
        if(userFound.rows.length === 0){ 
          return socket.emit("roomInfo", {status: false, error: "You are not a member of this room!"})
        }
        const userId = userFound.rows[0].user_id;
        toAddUsers.push(userId)
      }

      const room = await db.query(
        `
          INSERT INTO rooms (room_name, admin_id, room_description)
          VALUES ($1, $2, $3)
          RETURNING room_id;
        `,
        [roomName, adminId, roomDesc]
      )
      const room_id = room.rows[0].room_id

      for (const u of toAddUsers){
        await db.query(
          `
          INSERT INTO room_members (room_id, user_id)
          VALUES ($1, $2)
          ON CONFLICT (room_id, user_id) DO NOTHING
          `,
          [room_id, u]
        )
      }

      socket.emit("crtdRoom", {status: "Success", room_id: room_id, roomName: roomName})
    } catch (err){
      console.log(err)
      socket.emit("roomInfo", {status: false, error: err})
    }
  })

  // Join Room
  socket.on("room:join", async (roomId)=>{
    try{
      const userId = theSession.userId;
      if (!userId) {
        return socket.emit("roomInfo", {status: false, error: "You must be logged in to join a room."}) 
      }

      const roomFound = await db.query(
        `
        SELECT room_id, room_name, created_at, room_description, admin_id FROM rooms 
        WHERE room_id = $1;
        `,
        [roomId]
      )
      if(roomFound.rows.length === 0){
        return socket.emit("roomInfo", {status: false, error:"Room was not found!"})
      }
      const { room_id, room_name, created_at, room_description, admin_id } = roomFound.rows[0]
      const roomInfo = {room_id: room_id, room_name: room_name, created_at :created_at, room_description: room_description, admin_id: admin_id}
    
      const userFound = await db.query(
        `
        SELECT rm.joined_at,
               u.user_name
        FROM room_members rm
        JOIN users u ON rm.user_id = u.user_id
        WHERE rm.room_id = $1 AND u.user_id = $2;
        `,
        [roomId, userId]
      )
      if(userFound.rows.length === 0){
        return socket.emit("roomInfo", {status: false, error: "You are not a member of this room!"})
      }

      const oldMsgs_res = await db.query(
        `
        SELECT m.msg_id, m.msg_content, m.created_at, m.edited_at, m.msg_user_id,
                u.user_name, u.user_email
        FROM msgs m
        JOIN users u ON m.msg_user_id = u.user_id
        WHERE m.room_id = $1
        ORDER BY m.created_at ASC;
        `,
        [roomId]
      )
      const oldMsgs = oldMsgs_res.rows


      socket.join(`room:${roomId}`)
      socket.emit("roomInfo", {status: true, roomInfo: roomInfo})
      socket.to(`room:${roomId}`).emit(`room:${roomId}:msgback`, `${theSession.userName} connected at: ${new Date()}`)
    } catch (err) {
      console.log(err)
      socket.emit("roomError", "Unable to join room.")
    } 
  })
  
  // Get Old Messages
  socket.on("getOldMsgs", async (roomId) => {
    try {
      const oldMsgs_res = await db.query(
        `
        SELECT m.msg_id, m.room_id, m.msg_content, m.created_at, m.edited_at, m.msg_user_id,
                u.user_name, u.user_email
        FROM msgs m
        JOIN users u ON m.msg_user_id = u.user_id
        WHERE m.room_id = $1
        ORDER BY m.created_at ASC;
        `,
        [roomId]
      )
      const oldMsgs = oldMsgs_res.rows
      socket.emit("oldMsgs", oldMsgs)
    } catch (err) {
      console.log("getOldMsgs Error: ", err)
      socket.emit("roomError", "Failed to load old messages")
    }
  }) 

  // Leave Room 
  socket.on("leave-room", (roomId) => {
    socket.to(`room:${roomId}`).emit(`room:${roomId}:msgback`, `${theSession.userName} left at: ${new Date()}`)
    socket.leave(`room:${roomId}`);
  })  

  // Recive and send messeges 
  socket.on("sendMsg", async (msg)=>{
    try{
      const userId = theSession.userId;
      const dataBaseMsg = await db.query(
        `
        INSERT INTO msgs (room_id, msg_content, msg_user_id)
        VALUES ($1, $2, $3)
        RETURNING msg_id, room_id, msg_content, msg_user_id, created_at, edited_at
        `,
        [msg.roomId, msg.text, userId]
      )

      const resMsg = {
        ...dataBaseMsg.rows[0],
        user_name: theSession.userName
      };

      io.to(`room:${msg.roomId}`).emit(`msgback`, resMsg);

    } catch (err) {
      console.log(err)
      socket.emit("roomError", err)
    }
  }) 

  //Edit msg 
  socket.on("editMsg", async (msg)=>{
    try{
      const userId = theSession?.userId;

      const newMsgQ = await db.query(
        `
          UPDATE msgs 
              SET msg_content = $1, edited_at = CURRENT_TIMESTAMP
              WHERE msg_id = $2 AND msg_user_id = $3 
          RETURNING msg_id, msg_content, edited_at;
        `
      , [msg.text, msg.msgId, userId])
      if(newMsgQ.rows.length === 0) return;
      const {msg_id, msg_content, edited_at} = newMsgQ.rows[0]
      

      io.to(`room:${msg.roomId}`).emit(`editedMsg`, {msg_id, msg_content, edited_at});

    } catch (err) {
      console.log(err)
      socket.emit("roomError", err)
    }
  })
});



/* ----     AUTH  &  Security    ---- */

// Security 
function validatEmail(data){
  return body(data).trim().escape().isEmail().withMessage('Please enter a valid email!')
}
function validatData(data){
  return body(data).trim().escape()
}
function authMw(req, res, next){
  if(!req.session.loggedIn) return res.redirect("/Not_logged_in")
  next()
}

// Register 
app.post("/register", 
  [
    validatEmail('email'),
    validatData('pw')
  ],
  async (req, res)=>{
    try{
      const userName = req.body.userName;
      const email = req.body.email;
      const pw = req.body.password;
      
      if (req.session.loggedIn) { return res.send("Logout first!")} 
      if (!userName) { return res.send("Please type a user name!")} 
      if (!email) { return res.send("Please type an email!!")} 
      if (!pw) { return res.send("Please type a password!")} 

      const aUser = await db.query(
        'SELECT user_id FROM users WHERE user_email = $1;',
        [email]
      )

      if(aUser.rows.length > 0){ 
        return res.send("Account already exist, login instade.")
      }

      const password = bcrypt.hashSync(pw, saltRounds)

      const registered = await db.query(
        ` 
          INSERT INTO users (user_name, user_email, password_hash)
          VALUES ($1, $2, $3)
          RETURNING user_id, user_name, user_email, userCreated;
        `,
        [userName, email, password]
      )
      if(registered.rows.length === 0){ 
        return res.send("Account already exist")
      }
      const {user_id, user_name, user_email} = registered.rows[0]

      req.session.userId = user_id;
      req.session.userName = user_name;
      req.session.email = user_email; 
      req.session.loggedIn = true;

      return res.redirect("/")

    } catch(err){
      console.log(err)
      res.send("Something went wrong, error: "+err)
    }
})  

// Login
app.post("/login",  
  [
    validatEmail('email'),
    validatData('pw')
  ], 
  async (req, res)=>{ 
    try{
      const email = req.body.email;
      const pw = req.body.password;
      
      if (req.session.loggedIn) { return res.send("Logout first!")} 
      if (!email) { return res.send("Please type an email!!")} 
      if (!pw) { return res.send("Please type a password!")}

      const aUser = await db.query(
        "SELECT user_id, user_name, password_hash FROM users WHERE user_email = $1;",
        [email]
      )

      if(aUser.rows.length === 0){ 
        return res.send("Please register first!")
      }
      const { user_id, user_name, password_hash } = aUser.rows[0];

      const checkedPw = bcrypt.compareSync(pw, password_hash) //EDIT
      if (checkedPw){ 
      
        req.session.userId = user_id;
        req.session.userName = user_name;
        req.session.email = email; 
        req.session.loggedIn = true;
        return res.redirect("/")

      } else {
        res.send("Wrong password or email")
      }

    } catch(err){
      console.log(err)
      res.send("Something went wrong, error: "+err)
    }
  } 
)

app.get("/session", authMw, (req, res)=>{
  const session0 = req.session
  if(req.session.userId) {
    res.json({status: "Session", session: session0}) 
  } else {
    res.json({status: "No session"})
  }
})

app.get("/logout", (req,res)=>{
  req.session.destroy()
  res.redirect("/")
})

 

server.listen(port, ()=>{console.log("Server is running on: http://localhost:" + port)});
