const mongoose = require('mongoose');
const User = require('../models/User');

const contactSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
