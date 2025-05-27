const express = require("express");
const Chat = require("../models/Chat");
const chatRouter = express.Router();
const userAuth = require("../middlewares/auth");

chatRouter.get("/chat/:bugId", userAuth, async (req, res) => {
  try {
    const chats = await Chat.find({ bugId: req.params.bugId })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName")
      .populate("receiver", "firstName lastName");
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

module.exports = chatRouter;
