const express = require("express");
const User = require("../models/user");
const validateSignUp = require("../utils/validation");
const authRouter = express.Router();
const validator = require("validator");
const {
  generateVerificationToken,
  sendVerificationEmail,
} = require("../utils/emailAuthentication");
const crypto = require("crypto");
const userAuth = require("../middlewares/auth");

authRouter.post("/signup", async (req, res) => {
  validateSignUp(req);
  try {
    const { firstName, lastName, emailId, password, isDeveloper, skills, bio } =
      req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const { verifyToken, verifyHash } = generateVerificationToken();

    const user = new User({
      firstName,
      lastName,
      emailId,
      password,
      isDeveloper,
      verifyTokenHash: verifyHash,
      verifyTokenExpires: Date.now() + 1000 * 60 * 60 * 3,
      skills,
      bio,
    });
    await user.save();
    await sendVerificationEmail(user, verifyToken);

    res.status(201).json({
      message: "Verification email sent.",
      user: user.emailId,
    });
  } catch (err) {
    res.status(400).send("Error Saving User " + err.message);
  }
});

authRouter.get("/verify-email", async (req, res) => {
  try {
    const { token, id } = req.query;
    if (!token || !id) return res.status(400).send("Invalid link");
    const verifyHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      _id: id,
      verifyTokenHash: verifyHash,
      verifyTokenExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).send("Token invalid or expired");
    user.isVerified = true;
    user.verifyTokenHash = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();
    res.status(200).json({ success: true, message: "Email verified" });
  } catch (err) {
    res.status(500).send("Server error " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
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
    res.status(200).json({
      message: "Login successful",
      User: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        isDeveloper: user.isDeveloper,
        isVerified: user.isVerified,
        bio: user.bio,
        skills: user.skills,
      },
    });
  } catch (error) {
    console.error("Error in /login route:", error);
  }
});

authRouter.patch("/complete-profile", userAuth, async (req, res) => {
  try {
    const { bio, skills, isDeveloper } = req.body;
    const userId = req.user._id;

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { bio, skills, isDeveloper },
      { new: true }
    );
    res.json({ message: "Profile updated", user: updateUser });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" + err.message });
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

module.exports = authRouter;
