require('dotenv').config(); // Load environment variables

// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const userRoutes = require('./routes/user'); // Ensure this path is correct

const { forgotPassword } = require('./controllers/userController'); // Ensure this path is correct

// Initialize Express app
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Middleware to parse JSON data

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


  app.use(express.static("public"));

// Routes setup
app.use('/api/users', userRoutes); // Ensuring correct use



app.use('/users', userRoutes);

// Forgot Password Route (Consider moving this to `routes/user.js`)
app.post('/api/users/forgot-password', forgotPassword);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

app.get('/test', (req, res) => {
    res.send('Server is up and running');
  });
  

// Export app for testing purposes
module.exports = app;
