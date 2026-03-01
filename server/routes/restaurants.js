const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');
const roleCheck = require("../middleware/roleCheck");

/**
 * GET: Retrieve restaurant config.
 * Used for debugging or displaying a full list without location filtering
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 */
router.get('/', async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne();
        if (!restaurant) {
            return res.status(404).json({ message: "No restaurant config found"});
        }
        res.json(restaurant);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * PUT: Update delivery zone.
 * Modifies the geofence polygon.
 * Only accessible by admins and supervisors.
 */
router.put('/zone', auth, roleCheck(['admin', 'supervisor']), async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne();
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant config not found" });
        }

        restaurant.deliveryZone = req.body.deliveryZone;
        await restaurant.save();
        res.json(restaurant);
    } catch (err) {
        console.error("Zone Update Error: ", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

router.patch('/status', auth, roleCheck(['admin', 'supervisor']), async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne();
        if (!restaurant) {
            return res.status(404).json({message: "Restaurant config not found"});
        }

        restaurant.isOpen = !restaurant.isOpen;
        await restaurant.save();

        res.json({
            isOpen: restaurant.isOpen,
            message: restaurant.isOpen ? "Restaurant is OPEN" : "Restaurant is CLOSED" });
    } catch (err) {
        console.error("Status Update Error: ", err);
        res.status(500).json({ message: "Server Error" });
    }
})

/**
 * PUT: Update General Restaurant Settings.
 * Protected route: Only admins and supervisors can update these details
 */
router.put('/', auth, roleCheck(['admin', 'supervisor']), async (req, res) => {
    const { name, address, phone, email, deliveryFee, cuisine } = req.body;

    try {
        let restaurant = await Restaurant.findOne();

        if (!restaurant) {
            restaurant = new Restaurant({ name, address, phone, email, deliveryFee, cuisine });
        } else {
            if (name) restaurant.name = name;
            if (address) restaurant.address = address;
            if (phone) restaurant.phone = phone;
            if (email) restaurant.email = email;
            if (deliveryFee !== undefined) restaurant.deliveryFee = deliveryFee;
            if (cuisine) restaurant.cuisine = cuisine;
            restaurant.updatedAt = Date.now();
        }

        await restaurant.save();
        res.json(restaurant);
    } catch (err) {
        console.error("Error updating restaurant settings: ", err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;