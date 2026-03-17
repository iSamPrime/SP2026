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

/* import * as db from "./db" */



const port = process.env.PORT;

app.use(express.static(path.join(__dirname, "../client/dist"))); 


app.get("/room/:room_id", (req, res)=>{
  const email = req.session.email 
  const roomId = parseInt(req.params.room_id)
  

  console.log(roomId)
  const roomFound = rooms.find((r)=>r.roomId === roomId)
  console.log(roomFound)
  if(!roomFound){return res.json({ error: "Room not found" })}

  console.log(roomFound)
  const userFound = roomFound.members.includes(email);
  console.log(userFound)

  
  if(!userFound){return res.json({ error: "You are not in this room" })}

  const messages = msgs.filter((m)=> m.room === roomId)

  res.json(messages)
})



io.on("connection", (socket) => {
  const theSession = socket.request.session

  socket.on("room:join", (roomId)=>{
    socket.join(`room:${roomId}`)

    socket.to(`room:${roomId}`).emit(`room:${roomId}:msgback`, `${theSession.email?.split("@")[0]} connected at: ${new Date()}`)
  })

  socket.emit("oldMsgs", msgs)

  socket.on("sendMsg", (roomId, text)=>{
    const msg = {id: new Date(), room: roomId, sender: theSession.email, text: text}
    io.to(`room:${roomId}`).emit(`msgback`, msg);
    msgs.push(msg)
  }) 

});


const users = [  //REMOVE
  {userId: "1772992251900", email:"admin@home.com", password:"$2b$10$bBpjmkZ3IGdIsKos6SXCu.ItI8SMcAMY93gwxEO5gK5lWGchVBkiy"}
] 

const msgs = [  //REMOVE
  {id: 1, room: 1, sender:"banana", text: " gggggggggggggg gggg ggggggggggggggggggggggggggggggggggggggggggggggggggggg iu hrei greig reh gruigh reghreu rugh orgh reh reouhg ore hroh ", src: "", alt: "GG"},
  {id: 2, room: 1, sender:"admin@home.com",text: "gggggggggggggggggggggggggggggggggggggggggggggggg", src: "", alt: "GG"},
  {id: 3, room: 2, sender:"Someone", text: "gg", src: "", alt: "GG"},
  {id: 4, room: 1, sender:"Isac",  text: "gg", src: "", alt: "GG"}
       
] 

const rooms = [  //REMOVE
  {roomId: 1, created: "234242", admin: "admin@home.com", members:["admin@home.com", "gg@home.com"]},
  {roomId: 2, created: "658575", admin: "banana@homie.com", members:["admin@home.com", "banana@home.com"]}
] 




/* ----     AUTH     ---- */
function validatEmail(data){
  return body(data).trim().escape().isEmail().withMessage('Please enter a valid email!')
}
function validatPw(data){
  return body(data).trim().escape()
}

app.post("/registering", 
  [
    validatEmail('email'),
    validatPw('pw')
  ],
  (req, res)=>{
  const userId = Date.now();
  const email = req.body.email;
  const pw = req.body.pw.trim();
  
  if (req.session.loggedIn) { return res.send("Logout first") } 
  if (!email) { return res.send("Please type an email!") }
  if (!pw) { return res.send("Please type a password!") } 

  const notAUser = !users.find((e)=>e.email === email) //EDIT
  if(!notAUser){ return res.send("Account already exist, login instade") }

  const password = bcrypt.hashSync(pw, saltRounds)

  if (notAUser && pw){ 
    users.push({  // EDIT
      userId: userId, email:email, 
      password: password
    }) 
    console.log(users)
    req.session.userId = userId;
    req.session.email = email; 
    req.session.loggedIn = true;
    //db.query('')

    return res.send("Registered")
  }
  console.log(email, pw) //REMOVE
  console.log(users) //REMOVE
  console.log(req.session.email) //REMOVE
  console.log(req.session.loggedIn) //REMOVE
})  

app.post("/loggingin",  
  [
    validatEmail('email'),
    validatPw('pw')
  ], 
  (req, res)=>{ 
    try{
      const email = req.body.email;
      const pw = req.body.pw;
      
      if (req.session.loggedIn) { return res.send("Logout first") } 
      if (!email) { return res.send("Please type an email!") }
      if (!pw) { return res.send("Please type a password!") } 

      const user = users.find(e=>e.email===email) //EDIT
      if(!user){ return res.send("Please register first!") }

      const checkedPw = bcrypt.compareSync(pw, user.password) //EDIT
      
      if (user && pw && checkedPw){ 
      
        req.session.userId = user.userId;
        req.session.email = email; 
        req.session.loggedIn = true;
        //db.query('')
        
        return res.send("loggedIn")
      } else {
        res.send("Something went wrong")
      }

      console.log(email, pw) //REMOVE
      console.log(users) //REMOVE
      console.log(req.session.email) //REMOVE
    } catch (error){
      console.log(error.message)
    } 
  } 
) 

app.get("/session", (req, res)=>{
  const session0 = req.session
  if(req.session.userId) {
    res.json(session0) 
  } 
})

app.get("/logout", (req,res)=>{
    req.session.destroy()
    res.redirect("/")
})

 

server.listen(port, ()=>{console.log("Server is running on: http://localhost:" + port)});
