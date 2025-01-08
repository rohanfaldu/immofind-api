import express from 'express';
import {
  getAllDevelopers,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper,
  getDeveloperById
} from '../controllers/developersController.js';
import { authorize } from '../middleware/authorization.js'; // Adjust the path as needed

const router = express.Router();

// --- Developer Routes ---
// Get all developers (protected)
router.post('/', getAllDevelopers);

router.post('/getbyid', getDeveloperById);

// Create a developer (protected)
router.post('/create', authorize, createDeveloper);

// Update a developer (protected)
router.put('/:id', authorize, updateDeveloper);

// Delete a developer (protected)
router.delete('/:id', authorize, deleteDeveloper);

export default router;
