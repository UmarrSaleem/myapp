const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  password: String,
  resetToken: { type: String, default: null },  // ✅ Add this field
  resetTokenExpire: { type: Date, default: null } // ✅ Add this field
});



const User = mongoose.model('User', userSchema);

module.exports = User;

