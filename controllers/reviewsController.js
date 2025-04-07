const Review = require('../models/Review');
const CryptoJS = require('crypto-js');

exports.addReview = async (req, res) => {
    const { bookId } = req.params; // Extract bookId from the URL
    const { userId, comment, rating } = req.body; // Extract data from the request body

    if (!bookId || !userId || !comment || !rating) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Create a new review document
        const encryptedComment = CryptoJS.AES.encrypt(comment, process.env.CRYPTO_SECRET).toString();
        const newReview = new Review({
            bookId,
            userId,
            comment : encryptedComment,
            rating,
        });

        // Save the review to the database
        await newReview.save();

        res.status(201).json({ message: "Review added successfully." });
    } catch (error) {
        console.error("Error adding review:", error.message);
        res.status(500).json({ message: "Error adding review. Please try again." });
    }
};

exports.getReviewsByBook = async (req, res) => {
    const { bookId } = req.params;

    try {
        const reviews = await Review.find({ bookId }).populate('userId', 'username');

        // Ensure reviews with missing userId are handled
        const sanitizedReviews = reviews.map((review) => {
            const decryptedBytes = CryptoJS.AES.decrypt(review.comment, process.env.CRYPTO_SECRET);
            const decryptedComment = decryptedBytes.toString(CryptoJS.enc.Utf8);
            
            return{
            ...review.toObject(),
            comment: decryptedComment,
            userId: review.userId || { username: "Anonymous" },
            };
        });

        res.status(200).json(sanitizedReviews);
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
        res.status(500).json({ message: "Error fetching reviews. Please try again." });
    }
};

