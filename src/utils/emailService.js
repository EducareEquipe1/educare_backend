const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "educare.esisba@gmail.com",
    pass: "cfyk rxge tuaz zudi",
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
