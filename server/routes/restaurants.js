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

module.exports = router;