const express = require("express");
const User = require("../models/user");
const validateSignUp = require("../utils/validation");
const authRouter = express.Router();
const validator = require("validator");


authRouter.post("/signup", async (req, res) => {
  validateSignUp(req);
  try {
    const {
      first_name,
      last_name,
      emailId,
      password,
      isDevelper,
      skills,
      bio,
    } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({
      first_name,
      last_name,
      emailId,
      password,
      isDevelper,
      skills,
      bio,
    });
    const savedUser = await newUser.save();
    const token = await savedUser.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.status(201).json({
      message: "User created successfully",
      user: savedUser,
    });
  } catch(err) {
    res.status(400).send("Error Saving User " + err.message);
  }
});


authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if(!validator.isEmail(emailId)) {
      throw new Error("Email is not valid");
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      res.status(404).json({ message: "Invalid credentials" });
    }
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = await user.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error in /login route:", error);
  }
});

authRouter.post("/logout", (req,res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
})

module.exports = authRouter;