const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CryptoJS = require('crypto-js');

function isStrongPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
}

// Register User
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                msg: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            });
        }
        
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const encryptedEmail = CryptoJS.AES.encrypt(email, process.env.CRYPTO_SECRET).toString();
        user = new User({username, email: encryptedEmail, password: hashedPassword});
        await user.save();

        res.status(201).json({ userId: user._id, msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const users = await User.find();
        let user = null;
        for (let u of users){
            const bytes = CryptoJS.AES.decrypt(u.email, process.env.CRYPTO_SECRET);
            const decryptedEmail = bytes.toString(CryptoJS.enc.Utf8);
            if (decryptedEmail === email) {
                user = u;
                break;
            }
        }
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        // Generate a JWT token
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });

        // Respond with token and userId
        res.json({ token, userId: user._id });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};


// Validate JWT Token
exports.validateToken = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Authorization: Bearer <token>"

    if (!token) {
        return res.status(401).json({ msg: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {algorithms: ['HS256']});
        const user = await User.findById(decoded.user.id);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({ msg: "Token is valid", userId: user._id });
    } catch (err) {
        console.error("Invalid token:", err.message);
        res.status(401).json({ msg: "Invalid token" });
    }
};