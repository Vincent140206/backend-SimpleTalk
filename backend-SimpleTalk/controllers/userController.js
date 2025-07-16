const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.updatePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoProfile } = req.body;

    console.log('userId:', userId);
    console.log('photoProfile:', photoProfile);

    const result = await User.findByIdAndUpdate(userId, { photoProfile });

    if (!result) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'Foto profil diperbarui' });
  } catch (err) {
    console.error('Error update photo:', err);
    res.status(500).json({ message: 'Gagal update foto profil' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error getting profile:', err);
    res.status(500).json({ message: 'Gagal mendapatkan profil' });
  }
};