const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');  // MongoDB user model
const db = require('../config/database');  // MySQL connection
const sendEmail = require('../services/emailService'); // Import the email service
const nodemailer = require('nodemailer');
const router = express.Router();
const jwt = require('jsonwebtoken');  // Add JWT
const crypto = require('crypto'); 
// Load environment variables
require('dotenv').config();


// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: "Forbidden: Invalid token." });

        try {
            // Fetch user from MongoDB using decoded ID
            const user = await User.findById(decoded.userId);

            if (!user) return res.status(404).json({ error: "User not found." });

            req.user = user; // Attach user to request
            next();
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
        }
    });
}

// Dashboard Route (Requires Auth)
router.get("/dashboard", authenticateToken, (req, res) => {
    res.json({
        firstName: req.user.firstName,
        email: req.user.email
    });
});



router.post('/reset-password/:token', async (req, res) => {
  console.log('Reset Password Route Hit'); // Debugging log

  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find user by reset token in MongoDB
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in MongoDB
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    // Update password in MySQL
    const updateQuery = `UPDATE users SET password = ?, resetToken = NULL, resetTokenExpire = NULL WHERE email = ?`;

    await new Promise((resolve, reject) => {
      db.query(updateQuery, [hashedPassword, user.email], (err, result) => {
        if (err) {
          console.error('MySQL Update Error:', err);
          reject(new Error('Database error while updating password.'));
        } else {
          resolve();
        }
      });
    });

    res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Error resetting password. Please try again later.' });
  }
});






router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find user in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = Date.now() + 3600000; // 1 hour

    // Save reset token to MongoDB
    user.set({ resetToken: resetToken, resetTokenExpire: resetTokenExpire });
    // await user.save();
    await user.save({ validateBeforeSave: false });

    

    // user.resetToken = resetToken;
    // user.resetTokenExpire = resetTokenExpire;
    // await user.save();

    // Save reset token to MySQL with a Promise
    const updateQuery = `
      UPDATE users 
      SET resetToken = ?, resetTokenExpire = ? 
      WHERE email = ?`;

    await new Promise((resolve, reject) => {
      db.query(updateQuery, [resetToken, resetTokenExpire, email], (err, result) => {
        if (err) {
          console.error('MySQL Update Error:', err);
          reject(new Error('Database error while updating reset token.'));
        } else {
          resolve();
        }
      });
    });

    // Create the reset password link
    const resetPasswordLink = `${process.env.BASE_URL}/users/reset-password/${resetToken}`;

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Secure with env variables
        pass: process.env.EMAIL_PASS
      }
    });

    // Email details
    const mailOptions = {
      to: user.email,
      subject: 'Password Reset',
      text: `Click on the following link to reset your password: ${resetPasswordLink}`
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent.', resetToken });
  } catch (err) {
    console.error('Error in sending password reset email:', err);
    res.status(500).json({ error: 'Error in sending password reset email. ' + err.message });
  }
});






// Reset password route - handles the reset action



// router.post('/reset-password/:token', async (req, res) => {
//   console.log('Reset Password Route Hit'); // Debugging log

//   const { token } = req.params;
//   const { password } = req.body;

//   try {
//     const user = await User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });

//     if (!user) {
//       return res.status(400).send('Invalid or expired reset token.');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     user.password = hashedPassword;
//     user.resetToken = undefined;
//     user.resetTokenExpire = undefined;
//     await user.save();

//     res.status(200).send('Password has been reset.');
//   } catch (err) {
//     res.status(500).send('Error in resetting password: ' + err.message);
//   }
// });
 



// router.post('/reset-password/:token', async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   try {
//     // Find user by reset token
//     const user = await User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });

//     if (!user) {
//       return res.status(400).send('Invalid or expired reset token.');
//     }

//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Update user password and clear reset token
//     user.password = hashedPassword;
//     user.resetToken = undefined;
//     user.resetTokenExpire = undefined;
//     await user.save();

//     res.status(200).send('Password has been reset.');
//   } catch (err) {
//     res.status(500).send('Error in resetting password: ' + err.message);
//   }
// });
 


// Example route for testing
router.get('/', (req, res) => {
    res.send('User route is working!');
});



// 1. Signup Route
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user to MongoDB
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword  // Store the hashed password
        });

        await newUser.save();  // Save to MongoDB

        // Get the current timestamp for createdAt and updatedAt fields
        const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Insert the user into MySQL with both createdAt and updatedAt fields
        const query = 'INSERT INTO users (firstName, lastName, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)';
        db.execute(query, [firstName, lastName, email, hashedPassword, currentTimestamp, currentTimestamp], (err, results) => {
            if (err) {
                return res.status(400).send('Error saving user in MySQL: ' + err.message);
            }
            res.status(201).send('User registered successfully.');
        });

    } catch (err) {
        res.status(400).send('Error in registration: ' + err.message);
    }
});




// 2. Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email (MongoDB query)
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).send("User not found.");
        }

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send("Invalid password.");
        }

        // If password matches, login successful
        res.status(200).send("Login successful.");
    } catch (err) {
        res.status(500).send("Error in login: " + err.message);
    }
});





module.exports = router;
