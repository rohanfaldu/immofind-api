import express from 'express';
import { getAllPropertyTypeListings, createPropertyTypeListing,updatePropertyTypeListing,deletePropertyTypeListing} from '../controllers/propertyTypeListingsController.js';
import passport from 'passport';
const router = express.Router();

router.post('/', getAllPropertyTypeListings);
router.post('/create', createPropertyTypeListing);
// router.post('/:id', getPropertyTypeListingById);
router.put('/:id', updatePropertyTypeListing);
router.delete('/:id', deletePropertyTypeListing);

export default router;
