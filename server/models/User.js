const mongoose = require('mongoose');

/**
 * User Schema Blueprint.
 * Defines structure for auth and role management
 * Contains enum roles to enforce role-based access control.
 *
 * @author Ethan Swain
 */
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['customer', 'staff', 'supervisor', 'admin'],
        default: 'customer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);