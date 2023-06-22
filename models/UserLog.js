var mongoose = require('mongoose');

var UserLogSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, required: true, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserRegister' },
    logType: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserLog', UserLogSchema);
