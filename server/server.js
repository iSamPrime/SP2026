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



io.on("connection", (socket) => {
  console.log(socket.id) //REMOVE

  socket.on("msg", (text)=>{

    console.log(text) //REMOVE
    io.emit("msgback", text);
    
  }) 
});


const users = [] //REMOVE
const msgs = [] //REMOVE


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

    req.session.userId = userId;
    req.session.email = email; 
    req.session.loggedIn = true;
    //db.query('')

    return res.send("Registered")
  }



  console.log(email, pw) //REMOVE
  console.log(users)
  console.log(req.session.email)
  console.log(req.session.loggedIn)
  
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
        req.session.pw = user.password;
        req.session.loggedIn = true;
        //db.query('')
        
        return res.send("loggedIn")

      } else {
        res.send("Something went wrong")
      }

      console.log(email, pw) //REMOVE
      console.log(users)
      console.log(req.session.email)
      
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
