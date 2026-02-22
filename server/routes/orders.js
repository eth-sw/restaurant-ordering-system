const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const roleCheck = require("../middleware/roleCheck");
const { sendOrderUpdateSMS } = require('../utils/sms');

/**
 * POST: Create a new order.
 * Validates basket items, retrieves restaurant config, and saves order to the
 * DB linked to the customer.
 *
 * @param req HTTP Request object (body contains items, totalAmount, paymentId)
 * @param res HTTP Response object
 * @returns {Object} JSON object of created order
 *
 * @author Ethan Swain
 */
router.post('/', auth, async (req, res) => {
    const { items, totalAmount, paymentId } = req.body;

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        const restaurant = await Restaurant.findOne();
        if (!restaurant) {
            return res.status(500).json({ message: "Restaurant config missing" });
        }

        const newOrder = new Order({
            user: req.user.id,
            restaurant: restaurant._id,
            items,
            totalAmount,
            paymentId: paymentId || null,
            status: paymentId ? 'Accepted' : 'Pending'
        });

        const order = await newOrder.save();
        res.json(order);

    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * GET: Get order history for the logged in customer.
 * Returns history of orders sorted by newest first.
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 * @returns {Array} JSON array of order objects belonging to user
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
 * GET: Get all orders for the restaurant.
 * Only for Staff, Supervisor, or Admin.
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 * @returns {Array} JSON array of all orders for that user
 */
router.get('/all', auth, roleCheck(['staff', 'supervisor', 'admin']), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', ['name', 'email'])
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * PATCH: Update status of an order.
 *
 * @param req HTTP Request object (body contains status)
 * @param res HTTP Response object
 * @returns {Object} JSON object of updated order
 */
router.patch('/:id/status', auth, roleCheck(['staff', 'supervisor', 'admin']), async (req, res) => {
    const { status } = req.body;

    try {
        let order = await Order.findById(req.params.id).populate('user', ['name', 'phone']);
        if (!order) {
            return res.status(404).json({ message:'Order not found' });
        }

        order.status = status;
        await order.save();

        if (order.user && order.user.phone) {
            await sendOrderUpdateSMS(order.user.phone, status, order._id);
        }

        res.json(order);
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;