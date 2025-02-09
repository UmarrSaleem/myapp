const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const UserMongo = require('./models/user'); // MongoDB model
const UserMySQL = require('../models/user_mysql'); // MySQL model

const router = express.Router();

// Sign-Up Route
router.post(
  '/signup',
  // Express Validator for input validation
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Save to MongoDB
      const userMongo = new UserMongo({
        firstName,
        lastName,
        email,
        password: hashedPassword
      });
      await userMongo.save();

      // Save to MySQL
      const userMySQL = await UserMySQL.create({
        firstName,
        lastName,
        email,
        password: hashedPassword
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          firstName,
          lastName,
          email,
          id: userMySQL.id // MySQL user id
        }
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  }
);

module.exports = router;
