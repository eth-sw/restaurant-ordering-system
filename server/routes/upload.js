const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * Multer Storage Config
 * Defines where and how uploaded images are saved.
 *
 * @author Ethan Swain
 */
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

/**
 * File filter to ensure only images are uploaded.
 *
 * @param file jpg, jpeg, png, and webp
 */
const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only'))
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

/**
 * POST: Upload a menu item image.
 * Protected route: Only admins and supervisors can upload images.
 */
router.post('/', auth, roleCheck(['admin', 'supervisor']), upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({message: 'No file uploaded'});
    }
    // Return URL path so the frontend can save it to MenuItem DB
    res.send({imageUrl: `/uploads/${req.file.filename}`});
});

module.exports = router;