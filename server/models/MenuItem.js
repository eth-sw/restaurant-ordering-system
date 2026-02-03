const mongoose = require('mongoose');

/**
 * Menu Item Schema Blueprint
 *
 * @author Ethan Swain
 */
const MenuItemSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId, // Connects to specific Restaurant model
        ref: 'Restaurant',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['Pizza', 'Burger', 'Drink', 'Side', 'Dessert'],
        default: 'Pizza'
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);