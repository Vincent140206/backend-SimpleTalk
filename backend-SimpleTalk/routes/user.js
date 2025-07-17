const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { updatePhoto, getProfile } = require('../controllers/userController');

router.get('/profile', authMiddleware, getProfile);
router.put('/update-photo', authMiddleware, updatePhoto);
router.post('/delete-profile-photo', authMiddleware);

module.exports = router;
