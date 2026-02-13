const mongoose = require('mongoose');

/**
 * Restaurant Schema Blueprint
 *
 * @author Ethan Swain
 */
const RestaurantSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId, // Connects to specific User model
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    },

    deliveryZone: {
        type: {
            type: String,
            enum: ['Polygon'],
            default: 'Polygon'
        },
        coordinates: {
            type: [[[Number]]],
            required: false
        }
    }
});

// Enables spatial queries ($geoIntersects)
RestaurantSchema.index({ deliveryZone: '2dsphere' });

module.exports = mongoose.model('Restaurant', RestaurantSchema);