const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Change to your client URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Listen for room join requests from client
  socket.on('join-room', (roomId, userEmail) => {
    socket.join(`room:${roomId}`);
    console.log(`${userEmail} joined room:${roomId}`);

    // Broadcast to everyone in the room that a user connected
    socket.to(`room:${roomId}`).emit('user-connected', {
      email: userEmail,
      timestamp: new Date(),
      message: `${userEmail.split("@")[0]} connected at: ${new Date()}`
    });
  });

  // Listen for messages from clients
  socket.on('send-message', (message) => {
    console.log('Message received:', message);

    // Socket automatically knows which rooms it's in
    // Emit to all clients in the same room(s)
    socket.to(Object.keys(socket.rooms)).emit('msgback', message);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = io;