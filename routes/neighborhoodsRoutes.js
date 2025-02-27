import express from 'express';
import {
  createNeighborhood,
  getNeighborhoodsByDistrict,
  getNeighborhoodById,
  updateNeighborhood,
  deleteNeighborhood,
  getAllNeighborhoods,
  getNeighborhoodsByCity
} from '../controllers/neighborhoodsController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware

const router = express.Router();

// Create a new neighborhood
router.post("/create", authorize, createNeighborhood);

// Get neighborhoods by district
router.post("/id", getNeighborhoodsByDistrict);

router.post("/cityid", getNeighborhoodsByCity);

router.post("/", authorize, getAllNeighborhoods);

// Get neighborhood by ID
router.post("/getId", authorize, getNeighborhoodById);

// Update a neighborhood
router.put("/:id", authorize, updateNeighborhood);

// Delete a neighborhood
router.delete("/delete/:id", authorize, deleteNeighborhood);

export default router;
