const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      max: 20,
      min: 2,
    },
    last_name: {
      type: String,
      required: true,
      max: 20,
      min: 2,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong enough");
        }
      },
    },
    isDeveloper: {
      type: Boolean,
      default: false,
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  try {
    user.password = await bcrypt.hash(user.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (password){
  const user = this;
  try{
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch;
  }catch(err){
    throw new Error("Entered password is incorrect");
  }
}

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
  return token;
}

module.exports =  mongoose.model("User", userSchema);
