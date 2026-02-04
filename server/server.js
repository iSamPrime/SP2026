const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());

const port = 5555;
app.use(express.static(path.join(__dirname, "../client/dist")));



app.listen(port, ()=>{console.log("Server is running")});
