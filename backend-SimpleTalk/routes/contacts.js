const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Contact = require('../models/Contact');

// Tambah Kontak
router.post('/add', async (req, res) => {
  const { userId, username, email } = req.body;

  if (!userId || !username || !email) {
    return res.status(400).json({ message: 'User ID, username, dan email diperlukan' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Cari kontak berdasarkan nama dan email
    const contactUser = await User.findOne({ name: username, email: email });
    if (!contactUser) {
      return res.status(404).json({ message: 'Kontak tidak ditemukan di database' });
    }

    // Cek apakah sudah ada di daftar kontak
    const alreadyExists = user.contacts.some(
      c => c.userId.toString() === contactUser._id.toString()
    );
    if (alreadyExists) {
      return res.status(400).json({ message: 'Kontak sudah ada' });
    }

    // Tambahkan ke daftar kontak user
    user.contacts.push({ userId: contactUser._id });
    await user.save();

    console.log(`Kontak berhasil ditambahkan: ${contactUser._id}`);
    res.json({ 
      message: 'Kontak berhasil ditambahkan', 
      contact: {
        userId: contactUser._id,
        username: contactUser.name,
        email: contactUser.email
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Ambil Kontak
router.get('/:userId', async (req, res) => {
  console.log('UserID param:', req.params.userId);
    try {
        const user = await User.findById(req.params.userId).populate('contacts.userId', 'name email');
        if(!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        if (!user.contacts || user.contacts.length === 0) {
          return res.json({ contacts: [] });
        }

        const validContacts = user.contacts.filter(c => c.userId != null);
        res.json({ contacts: validContacts });
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Gagal Mengambil Kontak' });
      }
});

module.exports = router;