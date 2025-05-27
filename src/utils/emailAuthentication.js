const sendEmail = require("./sendEmail");
const crypto = require("crypto");

const generateVerificationToken = () => {
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyHash = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  return { verifyToken, verifyHash };
};

const sendVerificationEmail = async (user, verifyToken) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}&id=${user._id}`;
  await sendEmail(
    user.emailId,
    "Verify your BugFixer Pro Account",
    `<p>Hello ${user.firstName}</p>
     <p>Click the link below to verify your account. This link expires in 1 hour.</p>
     <a href="${verifyUrl}" style="color:#3b82f6">Verify Email</a>`
  );
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
};
