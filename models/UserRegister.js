var mongoose = require('mongoose');

var UserRegisterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'is invalid'],
    },
    phone: { type: String, unique: true, sparse: true },
    fullName: String,
    phone: Number,
    hash: String,
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserRegister', UserRegisterSchema);
