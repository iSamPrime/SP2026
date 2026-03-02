require("dotenv").config();
const path = require("path");

const express = require("express");
const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
/* import * as db from "./db" */

const { createServer } = require("http");
const { Server } = require("socket.io");
app.set("trust proxy", 1); // trust first proxy
const server = createServer(app);
const io = new Server(server,);

const port = process.env.PORT;
app.use(express.static(path.join(__dirname, "../client/dist"))); 

io.on("connection", (socket) => {
  console.log(socket.id) //REMOVE

  socket.on("msg", (text)=>{
    console.log(text) //REMOVE
    io.emit("msgback", text);
    /* db.query('') */
  })
});


const users = [] //REMOVE


app.post("/registering", (req, res)=>{
  const userId = Date.now();
  const email = req.body.email;
  const pw = req.body.pw;
  
  if (!users.find((e)=>e.email === email)){ //EDIT
    users.push({userId: userId, email:email, password:pw})
  } else {res.send("The email already exist, try to login instade!")}


  console.log(email, pw) //REMOVE
}) 









server.listen(port, ()=>{console.log("Server is running on: http://localhost:" + port)});
