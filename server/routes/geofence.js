const express = require('express');
const router = express.Router();
const Restaurant = require("../models/Restaurant");
const axios = require('axios');

/**
 * Check if a user's location is within a restaurant's delivery zone
 * and calculates the ETA.
 *
 * @param req HTTP request object (body contains lat, lng, and restaurantId)
 * @param res HTTP Response object
 * @returns {*} JSON object containing delivery availability, list of restaurants, and ETA
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
            // ETA Calculation Logic
            let eta = "30-45 mins"; // Default if API fails

            try {
                // Use first available restaurant to calculate distance
                const restaurant = restaurants[0];

                // Check restaurant has valid location set
                if (restaurant.location && restaurant.location.coordinates) {
                    // MogoDB is [Longitude, Latitude]
                    // Google Maps API is "Latitude,Longitude"
                    const originLat = restaurant.location.coordinates[1];
                    const originLng = restaurant.location.coordinates[0];

                    const origin = `${originLat},${originLng}`;
                    const destination = `${latitude},${longitude}`;
                    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

                    // Calls Google Distance Matrix API
                    const matrixRes = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=driving&key=${apiKey}`);

                    // Parse response
                    if (matrixRes.data.rows[0].elements[0].status === 'OK') {
                        const travelSeconds = matrixRes.data.rows[0].elements[0].duration.value;
                        const prepTimeSeconds = 20 * 60;

                        // Calculate total minutes
                        const totalMinutes = Math.ceil((travelSeconds + prepTimeSeconds) / 60);
                        eta = `${totalMinutes} mins`;
                    }
                }
            } catch (calcError) {
                console.error("ETA Calculation Warning:", calcError.message);
            }

            return res.json({
                canDeliver: true,
                availableRestaurants: restaurants,
                eta: eta,
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