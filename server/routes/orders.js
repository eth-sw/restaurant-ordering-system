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

/**
 * Get all orders for a specific restaurant.
 * Used by restaurant owner to view incoming orders
 *
 * @param req HTTP Request object (params contain restaurantId)
 * @param res HTTP Response object
 * @returns {*} JSON array of orders for that restaurant
 */
router.get('/restaurant/:restaurantId', auth, async (req, res) => {
    try {
        const Restaurant = require('../models/Restaurant')
        const restaurant = await Restaurant.findById(req.params.restaurantId);

        if (!restaurant) {
            return res.status(404).json({ message:'Restaurant not found' });
        }

        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorised' });
        }

        const orders = await Order.find({ restaurant: req.params.restaurantId })
            .populate('user', ['name', 'email'])
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * Update status of an order
 *
 * @param req HTTP Request object (body contains status)
 * @param res HTTP Response object
 * @returns {*} Updated order object
 */
router.patch('/:id/status', auth, async (req, res) => {
    const { status } = req.body;

    try {
        let order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message:'Order not found' });
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;