const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Log = require('../models/Log');

router.get('/', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const logs = await Log.find()
            .sort({ timestamp: -1 })
            .limit(100)
            .populate('adminId', 'name email');
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/', auth, roleCheck(['admin', 'supervisor']), async (req, res) => {
    const {action, description } = req.body;

    try {
        const newLog = new Log({
            action,
            description,
            adminId: req.body.adminId,
        });

        await newLog.save();
        res.status(201).json(newLog);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;