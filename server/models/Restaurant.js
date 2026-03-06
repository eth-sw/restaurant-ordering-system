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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    cuisine: {
        type: String
    },
    phone: {
        type: String,
        default: '01234 567890'
    },
    email: {
        type: String,
        default: 'contact@aberpizza.wales'
    },
    deliveryFee: {
        type: Number,
        default: 2.5
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
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);