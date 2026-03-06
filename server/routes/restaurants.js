const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');
const roleCheck = require("../middleware/roleCheck");
const Log = require('../models/Log');

/**
 * GET: Retrieve restaurant config.
 * Used for debugging or displaying a full list without location filtering.
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 *
 * @author Ethan Swain
 */
router.get('/', async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne();
        if (restaurant) {
            res.json(restaurant);
        } else {
            return res.status(404).json({message: "No restaurant config found"});
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**
 * PUT: Update delivery zone.
 * Modifies the geofence polygon.
 * Protected route: Only admins can update delivery zone.
 */
router.put('/zone', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne();
        if (restaurant) {
            restaurant.deliveryZone = req.body.deliveryZone;
            await restaurant.save();

            await Log.create({
                action: 'UPDATE_SETTINGS',
                description: `Global restaurant settings updated`,
                adminId: req.user.id
            });

            res.json(restaurant);
        } else {
            return res.status(404).json({message: "Restaurant config not found"});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
});

router.patch('/status', auth, roleCheck(['admin', 'supervisor']), async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne();
        if (restaurant) {
            restaurant.isOpen = !restaurant.isOpen;
            await restaurant.save();

            res.json({
                isOpen: restaurant.isOpen,
                message: restaurant.isOpen ? "Restaurant is OPEN" : "Restaurant is CLOSED"
            });
        } else {
            return res.status(404).json({message: "Restaurant config not found"});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
})

/**
 * PUT: Update General Restaurant Settings.
 * Protected route: Only admins can update these details
 */
router.put('/', auth, roleCheck(['admin']), async (req, res) => {
    const {name, address, phone, email, deliveryFee, cuisine, location} = req.body;

    try {
        let restaurant = await Restaurant.findOne();

        if (restaurant) {
            if (name) restaurant.name = name;
            if (address) restaurant.address = address;
            if (location) restaurant.location = location;
            if (phone) restaurant.phone = phone;
            if (email) restaurant.email = email;
            if (deliveryFee !== undefined) restaurant.deliveryFee = deliveryFee;
            if (cuisine) restaurant.cuisine = cuisine;
            restaurant.updatedAt = Date.now();
        } else {
            restaurant = new Restaurant({name, address, locaation, phone, email, deliveryFee, cuisine});
        }

        await restaurant.save();
        res.json(restaurant);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
});

module.exports = router;