const express = require('express');
const router = express.Router();
const { registerUser, loginUser, deleteAccount } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); 


router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/delete', authMiddleware, deleteAccount);

module.exports = router;