const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    bookId: { type: String, required: true }, // String to store Google Books API book IDs
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to user
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', ReviewSchema);
