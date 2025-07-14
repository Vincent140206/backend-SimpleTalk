// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
