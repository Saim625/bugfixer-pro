const express = require("express");
const userRouter = express.Router();
const Bug = require("../models/Bug");
const userAuth = require("../middlewares/auth");

userRouter.patch("/user/update-profile", userAuth, async (res, req) => {
  try {
    const loggedInUser = req.user._id;
    Object.keys(req.body).forEach((field) => {
      loggedInUser[field] = req.body[field];
    });
    await loggedInUser.save();
    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/dashboard", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const totalBugs = await Bug.countDocuments({ postedBy: loggedInUser });
    const openBugs = await Bug.countDocuments({
      postedBy: loggedInUser,
      status: "open",
    });
    const closedBugs = await Bug.countDocuments({
      postedBy: loggedInUser,
      status: "closed",
    });

    const fixRequestsSent = await FixRequest.countDocuments({
      requestedBy: loggedInUser,
    });
    const acceptedFixRequests = await FixRequest.countDocuments({
      requestedBy: loggedInUser,
      status: "accepted",
    });
    res.json({
      totalBugs,
      openBugs,
      closedBugs,
      fixRequestsSent,
      acceptedFixRequests,
    });
  } catch (err) {
    res.status(500).send("Error fetching dashboard stats");
  }
});
