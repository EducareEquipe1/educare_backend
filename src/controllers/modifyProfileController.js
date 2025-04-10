const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");
const sendEmail = require("../utils/emailService");

const JWT_SECRET = "*;':$S*O%k<gKB7'[6Heh4|J@nb{/!";

// ✅ modify profile infos
exports.modifyProfileInformations = asyncHandler(async (req, res) => {
  const { nom, prenom, new_email, num_tel } = req.body;
  const { email } = req.params; // Get email from request parameters

  try {
    // Find the user by old email
    const user = await Patient.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the new email already exists
    if (new_email !== email) {
    if (new_email) {
      const existingUser = await Patient.findUserByEmail(new_email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }
}

    // Call the saveUserProfile function to update the database
    const success = await Patient.saveUserProfile({
      nom,
      prenom,
      email,
      num_tel,
      new_email,
    });

    if (success) {
      res.status(200).json({ message: "Profile updated successfully" });
    } else {
      res.status(500).json({ message: "Failed to update profile" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
    console.log(error);
  }
});

exports.getUserProfileController = async (req, res) => {
  try {
    const email = req.params.email; // or req.query.email, or from token/session depending on how you're handling auth

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userProfile = await Patient.getUserProfile(email);

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error in getUserProfileController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
