const mongoose = require("mongoose");

const fixRequestSchema = new mongoose.Schema({
  bug: { type: mongoose.Schema.Types.ObjectId, ref: "Bug", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: "String", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("FixRequest", fixRequestSchema);
