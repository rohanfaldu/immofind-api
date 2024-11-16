const express = require("express");
const router = express.Router();
const districtController = require("../controllers/districtController");

// Create a new district
router.post("/create", districtController.createDistrict);

// Get districts by city
router.get("/", districtController.getDistrictsByCity);

// Get district by ID
router.get("/:id", districtController.getDistrictById);

// Update a district
router.put("/:id", districtController.updateDistrict);

// Delete a district
router.delete("/:id", districtController.deleteDistrict);

module.exports = router;
