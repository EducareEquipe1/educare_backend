const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nabahat.imane@gmail.com",
    pass: "sqoy tuqa pcva krst",
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "nabahat.imane@gmail.com",
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
