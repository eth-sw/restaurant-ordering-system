const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');

/**
 * Create a new restaurant
 * Links the new restaurant to the logged-in user
 *
 * @param req HTTP Request object (body contains name, address, cuisine)
 * @param res HTTP Response object
 * @returns {*} Restaurant object just created
 *
 * @author Ethan Swain
 */
router.post('/', auth, async (req, res) => {
    const { name, address, cuisine } = req.body;

    try {
        // Check if user already has a restaurant
        let restaurant = await Restaurant.findOne({ owner: req.user.id });
        if (restaurant) {
            return res.status(400).json({ message: 'You already have a restaurant' });
        }

        // Create the new restaurant linked to the user
        restaurant = new Restaurant({
            owner: req.user.id,
            name,
            address,
            cuisine
        });

        await restaurant.save();
        res.json(restaurant);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * Get the logged-in user's restaurant by ID
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 * @returns {*} User's restaurant object or 404 if not found
 */
router.get('/mine', auth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user.id });

        if (!restaurant) {
            return res.status(404).json({ message: 'No restaurant found for this user' });
        }

        res.json(restaurant);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;