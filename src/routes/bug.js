const express = require("express");
const bugRouter = express.Router();
const Bug = require("../models/Bug");
const userAuth = require("../middlewares/auth");
const multer = require("multer");
const storage = require("../utils/cloudinaryStorage");
const upload = multer({ storage });

bugRouter.post(
  "/create_bug",
  userAuth,
  upload.array("files", 5, { limits: { fileSize: 10 * 1024 * 1024 } }),
  async (req, res) => {
    try {
      const { title, description, tags } = req.body;
      if (!title || !description) {
        return res.status(400).send("Title and Description are required");
      }

      const uploadedFiles = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          uploadedFiles.push({
            originalName: file.originalname,
            fileUrl: file.path,
            uploadedBy: req.user._id,
          });
        }
      }

      const newBug = new Bug({
        title,
        description,
        tags,
        postedBy: req.user._id,
        files: uploadedFiles,
      });

      await newBug.save();
      await newBug.populate("postedBy", "firstName lastName");

      res.status(201).json({
        message: "Bug created successfully",
        bug: newBug,
      });
    } catch (err) {
      res.status(400).send("Error Saving Bug " + err.message);
    }
  }
);

bugRouter.get("/get_bugs", userAuth, async (req, res) => {
  try {
    const bugs = await Bug.find()
      .populate("postedBy", "firstName lastName")
      .sort({ createdAt: -1 });
    if (!bugs || bugs.length === 0) {
      return res.status(404).json({ message: "No bugs found" });
    }
    res.status(200).json({
      message: "Bugs fetched successfully",
      bugs: bugs,
    });
  } catch (err) {
    res.status(400).send("Error fetching bugs " + err.message);
  }
});

bugRouter.get("/get_bug/:id", userAuth, async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id).populate(
      "postedBy",
      "firstName lastName"
    );
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }
    res.status(200).json({
      message: "Bug fetched successfully",
      bug: bug,
    });
  } catch (err) {
    res.status(400).send("Error fetching bug " + err.message);
  }
});

bugRouter.delete("/delete_bug/:id", userAuth, async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      res.status(404).json({ message: "Bug not found" });
    }
    if (bug.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this bug" });
    }
    await Bug.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Bug deleted successfully",
    });
  } catch (err) {
    res.status(400).send("Error deleting bug " + err.message);
  }
});

bugRouter.patch("/update_bug/:id", userAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const { title, description, tags } = body;
    if (!title && !description && !tags) {
      return res.status(200).json({
        message: "No changes were made",
        bug: await Bug.findById(req.params.id),
      });
    }
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }
    if (bug.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this bug" });
    }
    if (title) bug.title = title;
    if (description) bug.description = description;
    if (tags) bug.tags = tags;
    await bug.save();
    res.status(200).json({
      message: "Bug updated successfully",
      bug: bug,
    });
  } catch (err) {
    res.status(400).send("Error updating bug " + err.message);
  }
});

bugRouter.get("/filter", userAuth, async (req, res) => {
  try {
    const { tags, status } = req.query;
    const filter = {};
    if (tags) filter.tags = { $regex: tags, $options: "i" };
    if (status) filter.status = status;
    const bugs = await Bug.find(filter)
      .populate("postedBy", " last_name")
      .sort({ createdAt: -1 });
    if (!bugs || bugs.length === 0) {
      return res.status(404).json({ message: "No bugs found" });
    }
    res.status(200).json({
      message: "Bugs fetched successfully",
      bugs: bugs,
    });
  } catch (err) {
    res.status(400).send("Error fetching bugs " + err.message);
  }
});
module.exports = bugRouter;
