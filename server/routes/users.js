const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const User = require('../models/User');

/**
 * GET: Get all users.
 * Protected route: Only admins can view the list of users.
 *
 * @author Ethan Swain
 */
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({createdAt: -1});
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err.message);
        res.status(500).send('Server Error');
    }
})

/**
 * POST: Admin creates a new user (Staff, Supervisor, Admin, or Customer)
 * Protected route: Only admins can create accounts.
 */
router.post('/', auth, roleCheck(['admin']), async (req, res) => {
    const {name, email, phone, password, role} = req.body;

    try {
        let user = await User.findOne({email});
        if (user) {
            return res.status(400).json({message: 'User already exists'});
        }

        user = new User({name, email, phone, password, role});

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json(userObj);
    } catch (err) {
        console.error("Error creating user:", err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * DELETE: Admin deletes a user
 * Protected route: Only admins can delete accounts.
 */
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        if (user._id.toString() === req.user.id) {
            return res.status(400).json({message: 'You cannot delete your own account'});
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({message: 'User removed successfully'});
    } catch (err) {
        console.error("Error deleting user:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;