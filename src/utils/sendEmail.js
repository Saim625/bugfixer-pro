const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use true for port 465
  auth: {
    user: "saimsaeed625@gmail.com",
    pass: "qtcb exfa wcdz arah",
  },
});

async function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: `"BugFixer Pro" <saimsaeed625@gmail.com>`,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
