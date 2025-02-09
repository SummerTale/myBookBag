const express = require('express');
const { addBookToReadingList, getReadingList } = require('../controllers/readingListController');
const router = express.Router();

// Add a book to the reading list
router.post('/add', addBookToReadingList);

// Get the user's reading list
router.get('/:userId', getReadingList);

module.exports = router;
