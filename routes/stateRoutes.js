// routes/stateRoutes.js
const express = require('express');
const router = express.Router();
const stateController = require('../controllers/stateController');

// Routes
router.post('/create', stateController.createState); // Create State
router.get('/', stateController.getStates); // Get All States with Cities

module.exports = router;
