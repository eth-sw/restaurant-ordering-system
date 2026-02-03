const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

/**
 * Adds a new menu item.
 * Finds the user's restaurant and links the new item to it
 *
 * @param req HTTP Request object (body contains name, price, category, description)
 * @param res HTTP Response object
 * @returns {*} Menu item object just created
 *
 * @author Ethan Swain
 */
router.post('/', auth, async (req, res) => {
    const { name, description, price, category } = req.body;

    try {
        // Finds the user's restaurant
        const restaurant = await Restaurant.findOne({ owner: req.user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'You must have a restaurant to add menu items' });
        }

        // Create new item linked to that restaurant
        const newItem = new MenuItem({
            restaurant: restaurant._id,
            name,
            description,
            price,
            category,
        });

        const item = await newItem.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * Get all menu items for logged-in user's restaurant
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 * @returns {*} JSON array of menu items
 */
router.get('/', auth, async (req, res) => {
    try {
        // Find the restaurant
        const restaurant = await Restaurant.findOne({ owner: req.user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Find all items where restaurant matches
        const items = await MenuItem.find({ restaurant: restaurant._id });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;