const express = require('express');
const router = express.Router();
const { registerUser, loginUser, deleteAccount, check } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); 


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/check', authMiddleware, check);
router.delete('/delete', authMiddleware, deleteAccount);

module.exports = router;