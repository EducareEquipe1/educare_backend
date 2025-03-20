const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "educare.esisba@gmail.com",
    pass: "kqzd saji hqce wrgb",
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "educare.esisba@gmail.com",
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
