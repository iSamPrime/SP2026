const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");

const { createServer } = require("http");
const { Server } = require("socket.io");
app.set("trust proxy", 1); // trust first proxy
const server = createServer(app);
const io = new Server(server,);

const port = 5555;
app.use(express.static(path.join(__dirname, "../client/dist"))); 

io.on("connection", (socket) => {
  console.log(socket.id)

  socket.on("msg", (text)=>{
  console.log(text)
})
  
});




server.listen(port, ()=>{console.log("Server is running")});
