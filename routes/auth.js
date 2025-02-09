const express = require('express');
const { registerUser, loginUser, validateToken } = require('../controllers/authController');
const router = express.Router();

// Token validation route
router.post("/validate", validateToken);

// Register new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

module.exports = router;
