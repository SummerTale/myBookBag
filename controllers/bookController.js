const axios = require('axios');

// Fetch all books (using search query)
exports.getAllBooks = async (req, res) => {
    const { search = 'romance' } = req.query; // Default search query is 'fiction'
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

    try {
        const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=${search}&key=${apiKey}`
        );

        const books = response.data.items.map(item => ({
            id: item.id,
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors?.join(', ') || 'Unknown',
            genre: item.volumeInfo.categories?.[0] || 'General',
            summary: item.volumeInfo.description || 'No description available',
            coverImage: item.volumeInfo.imageLinks?.thumbnail || 'No Image Available',
            averageRating: item.volumeInfo.averageRating || 'N/A',
            ratingsCount: item.volumeInfo.ratingsCount || 0,
        }));

        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error fetching books from Google Books API' });
    }
};

// Fetch details of a single book by ID
exports.getBookById = async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

    try {
        const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`
        );

        const item = response.data;
        const book = {
            id: item.id,
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors?.join(', ') || 'Unknown',
            genre: item.volumeInfo.categories?.[0] || 'General',
            summary: item.volumeInfo.description || 'No description available',
            coverImage: item.volumeInfo.imageLinks?.thumbnail || 'No Image Available',
            averageRating: item.volumeInfo.averageRating || 'N/A',
            ratingsCount: item.volumeInfo.ratingsCount || 0,
            publishedDate: item.volumeInfo.publishedDate || 'Unknown',
            pageCount: item.volumeInfo.pageCount || 0,
            language: item.volumeInfo.language || 'Unknown',
        };

        res.json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error fetching book details from Google Books API' });
    }
};
