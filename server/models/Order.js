const mongoose = require('mongoose');

/**
 * Order Schema Blueprint.
 * Defines the structure of an Order stored in MongoDB.
 * Links to User who placed order and Restaurant config.
 *
 * @author Ethan Swain
 */
const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    items: [
        {
            menuItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'MenuItem'
            },
            name: String,
            price: Number,
            qty: Number
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentId: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Cooking', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);