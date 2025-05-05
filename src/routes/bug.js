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

      res.status(201).json({
        message: "Bug created successfully",
        bug: populatedBug,
      });
    } catch (err) {
      res.status(400).send("Error Saving Bug " + err.message);
    }
  }
);

bugRouter.get("/get_bugs", userAuth, async (req,res) => {
  try {
    const bugs = await Bug.find().populate("postedBy", "first_name last_name").sort({ createdAt: -1 });
    if(!bugs || bugs.length === 0){
      return res.status(404).json({ message: "No bugs found" });
    }
    res.status(200).json({
      message: "Bugs fetched successfully",
      bugs: bugs,
    })
  }catch (err) {
    res.status(400).send("Error fetching bugs " + err.message);
  }
})

bugRouter.get("/get_bug/:id", userAuth, async (req,res) => {
  try{
    const bug = await Bug.findById(req.params.id).populate("postedBy", "first_name last_name");
    if(!bug){
      return res.status(404).json({ message: "Bug not found" });
    }
    res.status(200).json({
      message: "Bug fetched successfully",
      bug: bug,
    })
  }catch (err) {
    res.status(400).send("Error fetching bug " + err.message);
  }
})

module.exports = bugRouter;
