require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('node:path');

// Using Express framework
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware Config
 *
 * @author Ethan Swain
 */
app.use(cors()); // Allows React frontend to communicate with backend
app.use(express.json()); // Parses JSON payloads from requests

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Route Definitions
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/geofence', require('./routes/geofence'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/users', require('./routes/users'));
app.use('/api/logs', require('./routes/logs'));

/**
 * Backend and Database Status Check
 */
app.get('/api/status', (req, res) => {
    res.json({message: "Backend is running and DB is connected"});
});

/**
 * Starts the Server
 */
const startServer = async () => {
    try {
        // Attempt to connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');

        // Only listen if database connection is successful
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        // Log errors and exit
        console.error('MongoDB Connection Error:', err);
        process.exit(1); // Exit with failure code
    }
};

startServer();