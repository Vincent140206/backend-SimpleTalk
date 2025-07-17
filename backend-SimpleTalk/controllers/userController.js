const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

router.post('/delete-profile-photo', async (req, res) => {
  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: 'public_id dibutuhkan' });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);
    if (result.result === 'ok') {
      return res.json({ message: 'Foto berhasil dihapus' });
    } else {
      return res.status(500).json({ error: 'Gagal menghapus foto', result });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error saat menghapus foto', detail: err });
  }
});