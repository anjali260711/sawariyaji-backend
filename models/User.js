const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  rollNumber: String,
  mobile: String,
  email: String,
  branch: String,
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
