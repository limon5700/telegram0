const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }, 
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Message', messageSchema);
