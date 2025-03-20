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
  try {
    const mailOptions = {
      from: "educare.esisba@gmail.com",
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
