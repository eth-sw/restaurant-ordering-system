const mongoose = require('mongoose');

/**
 * Restaurant Schema Blueprint.
 *
 * @author Ethan Swain
 */
const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    cuisine: {
        type: String
    },
    deliveryZone: {
        type: {
            type: String,
            enum: ['Polygon'],
            default: 'Polygon'
        },
        coordinates: {
            type: [[[Number]]],
        }
    },
    isOpen: {
        type: Boolean,
        default: true
    },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);