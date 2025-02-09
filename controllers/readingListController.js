const ReadingList = require('../models/ReadingList');

// Add a book to the user's reading list
exports.addBookToReadingList = async (req, res) => {
    const { userId, book } = req.body;

    try {
        let readingList = await ReadingList.findOne({ user: userId });

        if (!readingList) {
            readingList = new ReadingList({ user: userId, books: [] });
        }

        // Check if the book is already in the list
        const bookExists = readingList.books.find(b => b.bookId === book.bookId);
        if (bookExists) {
            return res.status(400).json({ msg: 'Book already in reading list' });
        }

        readingList.books.push(book);
        await readingList.save();
        res.status(201).json({ msg: 'Book added to reading list', readingList });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Get the user's reading list
exports.getReadingList = async (req, res) => {
    const { userId } = req.params;
    console.log(`Fetching reading list for userId: ${userId}`);//Debug log

    try {
        const readingList = await ReadingList.findOne({ user: userId }).populate('user', 'username');
        if (!readingList || !Array.isArray(readingList.books)) {
            return res.status(404).json({ msg: 'No reading list found' });
        }

        res.json(readingList.books);
    } catch (err) {
        console.log('Error fetching reading list:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};
