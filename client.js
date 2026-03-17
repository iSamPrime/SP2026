// Updated client-side code
useEffect(() => {
  try {
    // Join the room when component mounts
    socketIo.emit('join-room', roomId, mySession.email);

    // Listen for incoming messages
    socketIo.on(`room:${roomId}:msgback`, (msg) => {
      setMsgs((prev) => [...prev, msg]);
    });

    // Listen for user connection notifications
    socketIo.on('user-connected', (data) => {
      console.log(data.message);
      // Optionally add connection notifications to messages
      setMsgs((prev) => [...prev, { 
        type: 'notification', 
        content: data.message 
      }]);
    });

    // Cleanup on unmount
    return () => {
      socketIo.off(`room:${roomId}:msgback`);
      socketIo.off('user-connected');
    };

  } catch (error) {
    console.log(error);
    setMsgs([]);
  }
}, [roomId, mySession, socketIo]);

// Function to send a message
const sendMessage = (messageContent) => {
  const messageData = {
    sender: mySession.email,
    content: messageContent,
    timestamp: new Date()
  };
  
  socketIo.emit('send-message', messageData);
};