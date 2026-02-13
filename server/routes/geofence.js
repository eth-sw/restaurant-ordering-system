const express = require('express');
const router = express.Router();
const Restaurant = require("../models/Restaurant");

/**
 * Check if a user's location is within a restaurant's delivery zone
 * Uses MongoDB's geospatial operators
 *
 * @param req HTTP request object (body contains lat, lng, and restaurantId)
 * @param res HTTP Response object
 * @returns {*} JSON object containing delivery availability and list of restaurants
 *
 * @auhor Ethan Swain
 */
router.post('/check-availability', async(req, res) => {
    const { restaurantId, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: "Missing location data" });
    }

    try {
        let query = {
            deliveryZone: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    }
                }
            }
        };

        if (restaurantId) {
            query._id = restaurantId;
        }

        const restaurants = await Restaurant.find(query);

        if (restaurants.length > 0) {
            return res.json({
                canDeliver: true,
                availableRestaurants: restaurants,
                message: "You are in the delivery zone."
            });
        } else {
            return res.json({
                canDeliver: false,
                availableRestaurants: [],
                message: "You are outside the delivery zone."
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
});

module.exports = router;