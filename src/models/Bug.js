const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [String],
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
    files: [
      {
        originalName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      requred: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bug", bugSchema);
