const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/delete', authMiddleware, authController.deleteAccount);

module.exports = router;
