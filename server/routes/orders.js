const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');

/**
 * Create a new order.
 * Validates basket items and saves the order to the database linked to the user.
 *
 * @param req HTTP Request object (body contains restaurantId, items, totalAmount)
 * @param res HTTP Response object
 * @returns {*} Created order object
 *
 * @author Ethan Swain
 */
router.post('/', auth, async (req, res) => {
    const { restaurantId, items, totalAmount } = req.body;

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        const newOrder = new Order({
            user: req.user.id,
            restaurant: restaurantId,
            items,
            totalAmount
        });

        const order = await newOrder.save();
        res.json(order);

    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * Get all orders for the logged in user.
 * Returns history of orders sorted by newest first.
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 * @returns {*} JSON array of orders
 */
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;