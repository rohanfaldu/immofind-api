import express from 'express';
import { createAgency, sendMail, getAllAgencies, getAgencyById, updateAgency, deleteAgency } from '../controllers/agencyController.js';
const router = express.Router();

// --- Start adding agency routes ---
// Create an agency
router.post('/agencies', createAgency);

router.post('/sendmail', sendMail);

// Get all agencies
router.get('/agencies', getAllAgencies);

// Get an agency by ID
router.get('/agencies/:id', getAgencyById);

// Update an agency
router.put('/agencies/:id', updateAgency);

// Delete an agency
router.delete('/agencies/:id', deleteAgency);


export default router;
