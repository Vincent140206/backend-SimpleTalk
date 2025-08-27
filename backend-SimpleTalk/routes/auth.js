const express = require('express');
const router = express.Router();
const { registerUser, loginUser, deleteAccount } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); 


router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/delete', authMiddleware, deleteAccount);
router.get('/check', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;