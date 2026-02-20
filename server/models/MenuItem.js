const mongoose = require('mongoose');

/**
 * Menu Item Schema Blueprint.
 *
 * @author Ethan Swain
 */
const MenuItemSchema = new mongoose.Schema({
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
    image: {
        type: String,
        default: 'https://placehold.co/400x300?text=No+Image'
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);