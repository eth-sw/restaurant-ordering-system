const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Password hashing library
const jwt = require('jsonwebtoken'); // Session token generator library
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * Register a new user
 * Validates input, encrypts password and saves user to database
 *
 * @param req HTTP Request object (body containing name, email, password)
 * @param res HTTP Response object
 * @returns {*} 201 if successful, 400 if user exists, 500 for server error
 *
 * @author Ethan Swain
 */
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists from email
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists'});
        }

        // Create new user instance
        user = new User({
            name,
            email,
            password
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save to DB
        await user.save();

        res.status(201).json({ message: 'User successfully registered'});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * Authenticate user and get token
 * Checks credentials and signs the JWT
 *
 * @param req HTTP Request object (body containing email, password)
 * @param res HTTP Response object
 * @returns {*} JSON object containing JWT token
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password with encrypted DB password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign and return the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * Retrieve all users
 * Used for testing/debugging
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 * @returns {*} JSON array of all user objects (without passwords)
 */
router.get('/all-users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Removes passwords
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * Get current user's profile
 * Uses ID from decoded JWT to get users details
 *
 * @param req HTTP Request object (requires the token)
 * @param res HTTP Response object
 * @returns {*} JSON object of logged-in user
 */
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;