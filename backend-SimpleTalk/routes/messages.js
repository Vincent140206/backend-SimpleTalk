const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const verifyToken = require('../middleware/authMiddleware');

router.get('/:userId/:contactId', verifyToken, async (req, res) => {
  try {
    const { userId, contactId } = req.params;

    const messages = await Message.find({
      $or: [
        { from: userId, to: contactId },
        { from: contactId, to: userId }
      ]
    }).sort({ timestamp: 1 });

    res.json({ messages });
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Hapus Pesan
router.delete('/:userId/:contactId', async (req, res) => {
  try {
    const { userId, contactId } = req.params;
    await Message.deleteMany({
      $or: [
        { from: req.params.userId, to: contactId },
        { from: contactId, to: req.params.userId }
      ]
    });
    console.log(`Messages between ${userId} and ${contactId} deleted successfully.`);
  } catch (err) {
    console.error('❌ Error deleting messages:', err);
    res.status(500).json({ message: 'Failed to delete messages' });
  }
  res.json({ message: 'Messages deleted successfully' });
});

module.exports = router;
