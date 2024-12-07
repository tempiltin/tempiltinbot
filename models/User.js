const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, default: "No username" },
  phone: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
