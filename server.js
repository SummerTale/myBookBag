const express = require('express');
const cors = require('cors');
const app = express();
const connectDB=require('./config/db');
require ('dotenv').config();

connectDB();

app.use(cors());
app.use(express.json()); // Middleware to parse incoming JSON data

// Define routes
app.use(express.static('public'));
app.use('/api/users', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/reading-list', require('./routes/readingList'));


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));