import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    default: "No username"
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    sparse: true
  },
  isSubscribed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', UserSchema);