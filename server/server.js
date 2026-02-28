require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const path = require("path"); 
/* import * as db from "./db" */

const { createServer } = require("http");
const { Server } = require("socket.io");
app.set("trust proxy", 1); // trust first proxy
const server = createServer(app);
const io = new Server(server,);

const port = process.env.PORT;
app.use(express.static(path.join(__dirname, "../client/dist"))); 

io.on("connection", (socket) => {
  console.log(socket.id)

  socket.on("msg", (text)=>{
  console.log(text)
  io.emit("msgback", text);
  /* db.query('') */

  })
  
});




server.listen(port, ()=>{console.log("Server is running on: http://localhost:" + port)});
