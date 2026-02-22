const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MenuItem = require('../models/MenuItem');
const roleCheck = require("../middleware/roleCheck");

/**
 * GET: Retrieve menu.
 * Gets all menu items.
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 *
 * @author Ethan Swain
 */
router.get('/', async (req, res) => {
    try {
        const items = await MenuItem.find();
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * POST: Adds a new menu item.
 * Only accessible by admins and supervisors.
 *
 * @param req HTTP Request object (body contains name, price, category, description, image)
 * @param res HTTP Response object
 *
 * @author Ethan Swain
 */
router.post('/', auth, roleCheck(['admin', 'supervisor']), async (req, res) => {
    const { name, description, price, category, image } = req.body;

    try {
        const newItem = new MenuItem({
            name,
            description,
            price,
            category,
            image
        });
        const item = await newItem.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * DELETE: Remove menu item.
 * Only accessible by admins and supervisors.
 */
router.delete('/:id', auth, roleCheck(['admin', 'supervisor']), async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        await MenuItem.findByIdAndDelete(req.params.id);
        res.json({ message: "Item removed"});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * PUT: Update existing menu item.
 * Only accessible by admins and supervisors.
 */
router.put('/:id', auth, roleCheck(['admin', 'supervisor']), async (req, res) => {
    try {
        let item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        const { name, description, price, category, image, isAvailable } = req.body;
        if (name) item.name = name;
        if (description) item.description = description;
        if (price) item.price = price;
        if (category) item.category = category;
        if (image) item.image = image;
        if (isAvailable !== undefined) item.isAvailable = isAvailable;

        await item.save();
        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;