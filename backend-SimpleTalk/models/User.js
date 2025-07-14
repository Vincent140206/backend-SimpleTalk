const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contacts: [contactSchema],
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Contact: mongoose.model('Contact', contactSchema)
};
