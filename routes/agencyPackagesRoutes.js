import express from 'express';
import {
  getAgencyPackage,
  createAgencyPackage,
  updateAgencyPackage,
  deleteAgencyPackage
} from '../controllers/agencyPackagesController.js';

const router = express.Router();

// Fetch all agency packages
router.post('/', getAgencyPackage);

// Create a new agency package
router.post('/create', createAgencyPackage);

// Update an agency package
router.put('/:id', updateAgencyPackage);

// Soft delete an agency package
router.delete('/:id', deleteAgencyPackage);

export default router;
