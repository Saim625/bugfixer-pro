const socket = require("socket.io");
const Chat = require("../models/Chat");

const initializeSockets = (server) => {
  const io = socket(server, {
    cors: { origin: process.env.CLIENT_REGION },
  });

  io.on("connection", (socket) => {
    socket.on("joinBugRoom", ({ bugId }) => {
      socket.join(bugId);
    });

    socket.on("sendMessage", async ({ bugId, senderId, text }) => {
      try {
        const saved = await Chat.create({ bugId, sender: senderId, text });
        io.to(bugId).emit("receiveMessage", {
          _id: saved._id,
          bugId,
          senderId,
          text,
        });
      } catch (err) {
        console.log(err);
      }
    });
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSockets;
