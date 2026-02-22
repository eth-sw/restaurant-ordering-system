const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * POST: Register a new customer.
 * Validates input, hashes the password, and saves user to database.
 * Admins and Staff must be created manually.
 *
 * @param req HTTP Request object (body containing name, email, password)
 * @param res HTTP Response object
 *
 * @author Ethan Swain
 */
router.post('/register', async (req, res) => {
    const { name, email, phone, password } = req.body;

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
            phone,
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
 * POST: Authenticate user and get token.
 * Checks credentials and returns a signed JWT containing user ID and role.
 *
 * @param req HTTP Request object (body containing email, password)
 * @param res HTTP Response object
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
            { expiresIn: '30d' },
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
 * GET: Retrieve all users.
 * Used for testing/debugging to view system users without passwords.
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
 * GET: Retrieve current user's profile.
 * Decodes JWT and gets full user object from the DB.
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