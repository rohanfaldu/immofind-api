import express from 'express';
import { createDistrict, getDistrictsByCity, getDistrictById, updateDistrict, deleteDistrict} from '../controllers/districtController.js';
import passport from 'passport';
const router = express.Router();

// Create a new district
router.post("/create", createDistrict);

// Get districts by city
router.post("/", getDistrictsByCity);

// Get district by ID
router.post("/:id", getDistrictById);

// Update a district
router.put("/:id", updateDistrict);

// Delete a district
router.delete("/:id", deleteDistrict);

export default router;