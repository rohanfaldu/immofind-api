import express from 'express';
import {
  getAllDevelopers,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper
} from '../controllers/developersController.js';

const router = express.Router();

// Fetch all agency packages
router.post('/', getAllDevelopers);

// Create a new agency package
router.post('/create', createDeveloper);

// Update an agency package
router.put('/:id', updateDeveloper);

// Soft delete an agency package
router.delete('/:id', deleteDeveloper);

export default router;
