import express from 'express';
import { getAllPropertyTypeListings, getPropertyTypeListingById, createPropertyTypeListing, updatePropertyTypeListing, deletePropertyTypeListing} from '../controllers/propertyTypeListingsController.js';
import passport from 'passport';
const router = express.Router();

router.post('/', getAllPropertyTypeListings);
router.post('/:id', getPropertyTypeListingById);
router.post('/', createPropertyTypeListing);
router.put('/:id', updatePropertyTypeListing);
router.delete('/:id', deletePropertyTypeListing);

export default router;
