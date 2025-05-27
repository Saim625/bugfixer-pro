const express = require("express");
const fixRequestRouter = express.Router();
const FixRequest = require("../models/FixRequest");
const userAuth = require("../middlewares/auth");
const Bug = require("../models/Bug");

fixRequestRouter.post("/fix-request/send", userAuth, async (req, res) => {
  try {
    const { bugId, message } = req.body;
    if (!bugId || !message) {
      return res
        .status(400)
        .json({ message: "Bug Id and Message are required" });
    }

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    if (bug.postedBy.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send request for your own bug" });
    }

    const reqExists = await FixRequest.findOne({
      bug: bugId,
      user: req.user._id,
    });

    if (reqExists) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const newRequest = new FixRequest({
      bug: bugId,
      user: req.user._id,
      message,
    });
    await newRequest.save();

    const populateReq = await FixRequest.findById(newRequest._id).populate(
      "user",
      "firstName lastName"
    );

    return res
      .status(201)
      .json({ message: "Request sent successfully", request: populateReq });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

fixRequestRouter.get("/requests/:bugId", userAuth, async (req, res) => {
  try {
    const { bugId } = req.params;
    if (!bugId) {
      return res.status(400).json({ message: "Bug Id is required" });
    }
    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }
    if (bug.postedBy.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        message: "You are not authorized to view this bug's requests",
      });
    }
    const requests = await FixRequest.find({ bug: bugId }).populate(
      "user",
      "firstName lastName"
    );
    if (requests.length === 0) {
      return res.status(404).json({ message: "No requests found" });
    }
    return res
      .status(200)
      .json({ message: "Requests fetched successfully", requests });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

fixRequestRouter.post(
  "/requests/:requestId/:action",
  userAuth,
  async (req, res) => {
    try {
      const { requestId, action } = req.params;

      if (!["accepted", "rejected"].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }
      if (!requestId || !action) {
        return res
          .status(400)
          .json({ message: "Request Id and Action are required" });
      }
      const request = await FixRequest.findById(requestId)
        .populate("bug")
        .populate("user", "firstName lastName");
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      if (request.bug.postedBy.toString() !== req.user._id.toString()) {
        return res
          .status(400)
          .json({ message: "You are not authorized to perform this action" });
      }
      if (request.status !== "pending") {
        return res.status(400).json({
          message: `This request has already been ${request.status}.  No further action can be taken.`,
          fixRequest: request,
        });
      }
      request.status = action === "accepted" ? "accepted" : "rejected";
      await request.save();
      res
        .status(200)
        .json({ message: `Request ${action}`, fixRequest: request });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  }
);

fixRequestRouter.get("/user/mine/requests", userAuth, async (req, res) => {
  try {
    const request = await FixRequest.find({ user: req.user._id }).populate(
      "bug",
      "title description"
    );
    if (!request || request.length === 0) {
      return res.status(404).json({ message: "No requests found" });
    }
    res.status(200).json({
      message: "Your requests fetched successfully",
      requests: request,
    });
  } catch (err) {
    res.status(400).send("Error fetching your requests: " + err.message);
  }
});

module.exports = fixRequestRouter;
