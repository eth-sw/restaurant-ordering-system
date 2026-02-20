const express = require('express');
const router = express.Router();
const Restaurant = require("../models/Restaurant");
const axios = require('axios');

/**
 * POST: Check if a user's location is within the restaurant delivery zone.
 * Calculates ETA using Google Mps API.
 *
 * @param req HTTP request object (body contains lat and lng)
 * @param res HTTP Response object
 *
 * @author Ethan Swain
 */
router.post('/check-availability', async(req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: "Missing location data" });
    }

    try {
        const restaurant = await Restaurant.findOne();

        if (!restaurant) {
            return res.status(404).json({ message: "No restaurant config found"})
        }

        const isInside = await Restaurant.findOne({
            _id: restaurant._id,
            deliveryZone: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    }
                }
            }
        })

        if (isInside) {
            // ETA Calculation Logic
            let eta = "30-45 mins"; // Default if API fails

            try {
                // Check restaurant has valid location set
                if (restaurant.location && restaurant.location.coordinates) {
                    const originLat = restaurant.location.coordinates[1];
                    const originLng = restaurant.location.coordinates[0];
                    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

                    const origin = `${originLat},${originLng}`;
                    const destination = `${latitude},${longitude}`;

                    // Calls Google Distance Matrix API
                    const matrixRes = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=driving&key=${apiKey}`);

                    // Parse response
                    if (matrixRes.data.rows[0].elements[0].status === 'OK') {
                        const travelSeconds = matrixRes.data.rows[0].elements[0].duration.value;
                        const prepTime = 20 * 60;

                        // Calculate total minutes
                        const totalMinutes = Math.ceil((travelSeconds + prepTime) / 60);
                        eta = `${totalMinutes} mins`;
                    }
                }
            } catch (calcError) {
                console.error("ETA Calculation Warning:", calcError.message);
            }

            return res.json({
                canDeliver: true,
                eta: eta,
                message: "You are in the delivery zone."
            });
        } else {
            return res.json({
                canDeliver: false,
                message: "You are outside the delivery zone."
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
});

module.exports = router;