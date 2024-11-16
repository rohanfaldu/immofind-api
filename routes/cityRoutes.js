// cityRoutes.js
const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController'); // Ensure this path is correct

// Define your routes here
router.post('/create', cityController.createCity);
router.get('/', cityController.getCities);
router.get('/search', cityController.getCitiesByState);

module.exports = router;
