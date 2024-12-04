import express from 'express';
import { createAgency, sendMail, getAllAgencies, getAgencyById, updateAgency, deleteAgency } from '../controllers/agencyController.js';
const router = express.Router();

// --- Start adding agency routes ---
// Create an agency
router.post('/create', createAgency);

router.post('/sendmail', sendMail);

// Get all agencies
router.post('/', getAllAgencies);

// Get an agency by ID
router.get('/:id', getAgencyById);

// Update an agency
router.put('/:id', updateAgency);

// Delete an agency
router.delete('/:id', deleteAgency);


export default router;
