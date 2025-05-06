const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profileImage: { type: String },
  status: { type: String, default: 'active' }
});

module.exports = mongoose.model('User', userSchema);
