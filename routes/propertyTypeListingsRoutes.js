const express = require('express');
const router = express.Router();
const propertyTypeListingsController = require('../controllers/propertyTypeListingsController');

router.get('/', propertyTypeListingsController.getAllPropertyTypeListings);
router.get('/:id', propertyTypeListingsController.getPropertyTypeListingById);
router.post('/', propertyTypeListingsController.createPropertyTypeListing);
router.put('/:id', propertyTypeListingsController.updatePropertyTypeListing);
router.delete('/:id', propertyTypeListingsController.deletePropertyTypeListing);

module.exports = router;
