const validator = require("validator");

const validateSignUp = (req) => {
  const { first_name, last_name, emailId, password } =
    req.body;

  if (!first_name || !last_name || !emailId || !password) {
    throw new Error("Please fill all the fields");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

module.exports = validateSignUp;