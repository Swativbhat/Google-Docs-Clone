const socketio = require('socket.io');

let io;

const init = (server) => {
  io = socketio(server, {
    cors: {
      origin: process.env.BASE_URL,
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join-document', (documentId) => {
      if (!documentId) {
        console.error("Document ID is undefined or invalid.");
        return;
      }
      socket.join(documentId);  // Join the room
      console.log(`User joined document room: ${documentId}`);
    });

    socket.on('send-changes', (delta, documentId) => {
      if (!delta || !documentId) {
        console.error("Missing delta or document ID.");
        return;
      }
      console.log('Document ID:', documentId);
      if (!socket.rooms.has(documentId)) {
        console.error(`Socket is not in room ${documentId}`);
        return;
      }
      socket.to(documentId).broadcast.emit('receive-changes', delta);
    });

    socket.on('send-message', (message, documentId) => {
      const chatMessage = {
        user: socket.user,
        message,
        documentId,
        timestamp: new Date()
      };
      io.to(documentId).emit('receive-message', chatMessage);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  init,
  getIO
};