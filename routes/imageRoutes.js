// routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Route for single image upload
router.post('/upload/single', imageController.uploadSingleImage);

// Route for multiple images upload
router.post('/upload/multiple', imageController.uploadMultipleImages);

// POST route to handle multiple image uploads from JSON data
router.post('/upload/multiple-json', imageController.uploadMultipleImagesFromJson);


module.exports = router;
