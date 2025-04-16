const socketio = require("socket.io");
const { saveDocumentContent,getDocumentContent  } = require("./documentService");
let io;

const init = (server) => {
  io = socketio(server, {
    cors: {
      origin: process.env.BASE_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("join-document", async (documentId) => {
      socket.join(documentId);
      try {
        const content = await getDocumentContent(documentId);
        socket.emit("load-document", content);
      } catch (error) {
        console.error("Error loading document:", error);
      }
    });

    socket.on("send-changes", async (delta, documentId) => {
      if (!delta || !documentId) return;


      socket.to(documentId).emit("receive-changes", delta);


      try {
        const quill = getQuillInstanceForDocument(documentId); 
        const content = quill.getContents();
        await saveDocumentContent(documentId, content);
      } catch (error) {
        console.error("Error saving changes:", error);
      }
    });

    socket.on("send-message", (message, documentId) => {
      const chatMessage = {
        user: socket.user,
        message,
        documentId,
        timestamp: new Date(),
      };
      io.to(documentId).emit("receive-message", chatMessage);
    });

    socket.on("join-user-room", (userId) => {
      socket.join(userId);
    });

    socket.on("notification", (data) => {
      console.log("Received notification:", data); 

    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  init,
  getIO,
};
