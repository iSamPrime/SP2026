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
  socket.on("reqMyRooms", ()=>{
    const user = theSession.email
    const myRooms = rooms.filter((room)=>room.admin === user) //Edit


    socket.emit("resMyRooms", myRooms)
  })

  // Update my rooms
/*   socket.on("updateRoom", (req)=>{
    const theRoom = rooms.find(room=>room.roomId === req.roomId) //Edit
    rooms.find((room)=>room.roomId === req.roomId) //Edit
  })
*/

  // Create Room
  socket.on("creRoom", async (reqRoom)=>{
    try{
      const roomName = reqRoom.roomName;
      const emails = reqRoom.users;
      const roomDesc = reqRoom.desc || "A new room!"
      const adminId = theSession.userId;
      const toAddUsers = []
      toAddUsers.push(adminId) 
      console.log(adminId)

      for (const u of emails){
        const userFound = await db.query(
          "SELECT user_id FROM users WHERE user_email = $1",
          [u]
        )
        if(userFound.rows.length === 0){ 
          return socket.emit("roomError", "You are not a member of this room!") 
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

      socket.emit("crtdRoom", {status: "Success", roomId: room_id, roomName: roomName})
    } catch (err){
      console.log(err)
      socket.emit("roomError", err)
    }
  })

  // Join Room
  socket.on("room:join", async (roomId)=>{
    try{
      if (!theSession?.userId) {
        return socket.emit("roomError", "You must be logged in to join a room.")
      }


      const roomFound = await db.query(
        `
        SELECT room_id, room_name, created_at, room_description, admin_id FROM rooms 
        WHERE room_id = $1;
        `,
        [roomId]
      )
      if(roomFound.rows.length === 0){
        return socket.emit("roomError", "Room was not found!")
      }
      const { room_id, room_name, created_at, room_description, admin_id } = roomFound.rows[0]
      const roomInfo = {room_id: room_id, room_name: room_name, created_at :created_at, room_description: room_description, admin_id: admin_id}
    

      const userId = theSession.userId 
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
        return socket.emit("roomError", "You are not a member of this room!")
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
      socket.emit("roomInfo", roomInfo)
      socket.emit("oldMsgs", oldMsgs)
      socket.to(`room:${roomId}`).emit(`room:${roomId}:msgback`, `${theSession.user?.split("@")[0]} connected at: ${new Date()}`)
    } catch (err) {
      console.log(err)
      socket.emit("roomError", "Unable to join room.")
    } 
  })


  // Recive and send messeges 
  socket.on("sendMsg", async (msg)=>{
    try{
      const dataBaseMsg = await db.query(
        `
        INSERT INTO msgs (room_id, msg_content, msg_user_id)
        VALUES ($1, $2, $3)
        RETURNING msg_id, room_id, msg_content, msg_user_id, created_at, edited_at
        `,
        [msg.roomId, msg.text, theSession.userId]
      )

      const resMsg = {
        ...dataBaseMsg.rows[0],
        user_name: theSession.userName
      };
      console.log(msg.roomId)
      console.log(resMsg)

      io.to(`room:${msg.roomId}`).emit(`msgback`, resMsg);

    } catch (err) {
      console.log(err)
      socket.emit("roomError", err)
    }
  }) 
});













let users = [  //REMOVE
  {userId: 1772992251900, email: 'admin@home.com', password: '$2b$10$bBpjmkZ3IGdIsKos6SXCu.ItI8SMcAMY93gwxEO5gK5lWGchVBkiy'},
  {userId: 1774467143323, email: 'banana@home.com', password: '$2b$10$M4APJxU2f4y5cM6QrOufx.7mVsFSBDLxEErU3Xjxdhzel7twpUB2y'},
  {userId: 1774467243713, email: 'gg@home.com', password: '$2b$10$IcxIrqDcdEzL8Anu0qo2l.TUAgwlz3UHgOiK00sRkZ25thgBsNTc.'},
] 

let msgs = [  //REMOVE
  {id: 1, room: "1", sender:"banana", text: " gggggggggggggg gggg ggggggggggggggggggggggggggggggggggggggggggggggggggggg iu hrei greig reh gruigh reghreu rugh orgh reh reouhg ore hroh ", src: "", alt: "GG"},
  {id: 2, room: "1", sender:"admin@home.com",text: "gggggggggggggggggggggggggggggggggggggggggggggggg", src: "", alt: "GG"},
  {id: 3, room: "2", sender:"Someone", text: "gg", src: "", alt: "GG"},
  {id: 4, room: "1", sender:"Isac",  text: "gg", src: "", alt: "GG"}
  
] 

let rooms = [  //REMOVE
  {roomId: "1", roomName: "My room 1", admin: 'admin@home.com', members:["admin@home.com", "gg@home.com"]},
  {roomId: "2", roomName: "My room 2", admin: 'banana@home.com', members:["admin@home.com", "banana@home.com"]}
] 




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
      
      if (req.session.loggedIn) { return res.redirect("/error/Logout first!")} 
      if (!userName) { return res.send("Please type a user name!")} 
      if (!email) { return res.send("Please type an email!!")} 
      if (!pw) { return res.send("Please type a password!")} 

      const aUser = await db.query(
        'SELECT user_id FROM users WHERE user_email = $1;',
        [email]
      )

      if(aUser.rows.length > 0){ 
        return res.json("Account already exist, login instade.")
      }

      const password = bcrypt.hashSync(pw, saltRounds)

      req.session.userId = aUser.user_id;
      req.session.userName = userName;
      req.session.email = email; 
      req.session.loggedIn = true;

      const registered = await db.query(
        ` 
          INSERT INTO users (user_name, user_email, password_hash)
          VALUES ($1, $2, $3)
          RETURNING user_name, user_email, userCreated;
        `,
        [userName, email, password]
      )
      if(registered.rows.length === 0){ 
        return res.json({status: false, error:"Account already exist"})
      }

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
        return res.json({status: false, error:"Please register first!"})
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

app.get("/error/:err", (req, res)=>{
  const err = req.params.err; 
  res.send(err)
})

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
