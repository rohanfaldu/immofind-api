const express = require('express');
const router = express.Router();
const propertyTypeListingsController = require('../controllers/propertyTypeListingsController');

router.post('/', propertyTypeListingsController.getAllPropertyTypeListings);
router.post('/:id', propertyTypeListingsController.getPropertyTypeListingById);
router.post('/', propertyTypeListingsController.createPropertyTypeListing);
router.put('/:id', propertyTypeListingsController.updatePropertyTypeListing);
router.delete('/:id', propertyTypeListingsController.deletePropertyTypeListing);

module.exports = router;
