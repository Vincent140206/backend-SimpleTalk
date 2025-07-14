const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Contact = require('../models/Contact');

// Tambah Kontak
router.post('/add', async (req, res) => {
    const { userId, contactId } = req.body;

    if (!userId || !contactId) {
        return res.status(400).json({ message: 'User ID dan Contact ID diperlukan' });
    }
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const alreadyExists = user.contacts.some(c => c.userId.toString() === contactId);
        if (alreadyExists) {
            return res.status(400).json({ message: 'Kontak sudah ada' });
        }
        
        user.contacts.push({ userId: contactId });
        await user.save();

        printf('Kontak berhasil ditambahkan: %s', contactId);
        res.json({ message: 'Kontak berhasil ditambahkan', contacts: user.contacts });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// Ambil Kontak
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('contacts.userId', 'username email');
        if(!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.json({ contacts: user.contacts });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Gagal Mengambil Kontak' });
    }
});

module.exports = router;