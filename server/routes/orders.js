const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const roleCheck = require("../middleware/roleCheck");
const {sendOrderUpdateSMS} = require('../utils/sms');
const MenuItem = require('../models/MenuItem');

/**
 * POST: Create a new order.
 * Validates basket items, retrieves restaurant config, and saves order to the
 * DB linked to the customer.
 * Uses optionalAuth for registered users and guest checkouts.
 *
 * @param req HTTP Request object (body contains items, totalAmount, paymentId)
 * @param res HTTP Response object
 * @returns {Object} JSON object of created order
 *
 * @author Ethan Swain
 */
router.post('/', optionalAuth, async (req, res) => {
    const {items, paymentId, customerInfo} = req.body;

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({message: "No items in order"});
        }

        // Confirms customer delivery info is present
        if (!customerInfo?.address || !customerInfo?.phone || !customerInfo?.name || !customerInfo?.email) {
            return res.status(400).json({message: "Missing delivery information"})
        }

        const restaurant = await Restaurant.findOne();
        if (!restaurant) {
            return res.status(500).json({message: "Restaurant config missing"});
        }

        let calculatedTotal = 0;
        const secureItems = [];

        for (let item of items) {
            const dbItem = await MenuItem.findById(item.menuItem);
            if (dbItem) {
                calculatedTotal += (dbItem.price * item.qty);
                secureItems.push({
                    menuItem: dbItem._id,
                    name: dbItem.name,
                    price: dbItem.price,
                    qty: item.qty
                })
            }
        }

        if (restaurant.deliveryFee) {
            calculatedTotal += restaurant.deliveryFee;
        }

        const newOrder = new Order({
            user: req.user ? req.user.id : null, // Set user ID if logged in, otherwise null
            customerInfo,
            restaurant: restaurant._id,
            items: secureItems,
            totalAmount: calculatedTotal,
            paymentId: paymentId || null,
            status: paymentId ? 'Accepted' : 'Pending'
        });

        const order = await newOrder.save();
        res.json(order);

    } catch (err) {
        console.error(err);
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
        const orders = await Order.find({user: req.user.id}).sort({createdAt: -1});
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**
 * GET: Get all orders for the restaurant.
 * Protected route: Only for Staff, Supervisor, or Admin.
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 * @returns {Array} JSON array of all orders for that user
 */
router.get('/all', auth, roleCheck(['staff', 'supervisor', 'admin']), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', ['name', 'email'])
            .sort({createdAt: -1});
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**
 * PATCH: Update status of an order.
 * Protected route: Only for staff, supervisor, or admin.
 *
 * @param req HTTP Request object (body contains status)
 * @param res HTTP Response object
 * @returns {Object} JSON object of updated order
 */
router.patch('/:id/status', auth, roleCheck(['staff', 'supervisor', 'admin']), async (req, res) => {
    const {status} = req.body;

    try {
        let order = await Order.findById(req.params.id).populate('user', ['name', 'phone']);
        if (!order) {
            return res.status(404).json({message: 'Order not found'});
        }

        order.status = status;
        await order.save();

        // Check for guest phone number first, otherwise use user account phone number
        const phoneToSend = order.customerInfo?.phone || order.user?.phone;

        if (phoneToSend) {
            await sendOrderUpdateSMS(phoneToSend, status, order._id);
        }

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**
 * GET: Track order (Public/Guest route)
 * Allows guest to view their live order status using their order ID without needed to authenticate.
 * Used on OrderSuccess screen.
 *
 * @param req HTTP Request object (body contains order ID)
 * @param res HTTP Response object
 * @returns {Object} JSON object of requested order
 */
router.get('/track/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
})

module.exports = router;