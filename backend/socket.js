const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] },
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };
