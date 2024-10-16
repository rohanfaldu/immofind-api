const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController'); // Import agency controller




// --- Start adding agency routes ---
// Create an agency
router.post('/agencies', agencyController.createAgency);

// Get all agencies
router.get('/agencies', agencyController.getAllAgencies);

// Get an agency by ID
router.get('/agencies/:id', agencyController.getAgencyById);

// Update an agency
router.put('/agencies/:id', agencyController.updateAgency);

// Delete an agency
router.delete('/agencies/:id', agencyController.deleteAgency);


module.exports = router;
