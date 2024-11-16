// routes/districtRoutes.js
const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');

// Routes
router.post('/create', districtController.createDistrict); // Create District
router.get('/', districtController.getDistrictsByCity); // Get Districts by City

module.exports = router;
