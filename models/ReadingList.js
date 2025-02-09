const mongoose = require('mongoose');

const ReadingListSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    books: [
        {
            bookId: { type: String, required: true }, // Google Books ID
            title: { type: String, required: true },
            author: { type: String },
            coverImage: { type: String },
        }
    ]
});

module.exports = mongoose.model('ReadingList', ReadingListSchema);
