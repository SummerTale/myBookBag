const express = require('express');
const { getAllBooks, getBookById } = require('../controllers/bookController');
const router = express.Router();

// Get all books (with optional search query)
router.get('/', getAllBooks);

// Get details of a single book by ID
router.get('/:id', getBookById);

module.exports = router;
