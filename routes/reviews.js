const express = require('express');
const { addReview, getReviewsByBook } = require('../controllers/reviewsController');
const router = express.Router();

// Add a new review
router.post('/:bookId', addReview);

// Get reviews for a specific book
router.get('/:bookId', getReviewsByBook);

module.exports = router;
