import express from 'express';
import { getAllPropertyTypeListings, createPropertyTypeListing,updatePropertyTypeListing,deletePropertyTypeListing} from '../controllers/propertyTypeListingsController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware
const router = express.Router();

router.post('/',authorize, getAllPropertyTypeListings);
router.post('/create',authorize, createPropertyTypeListing);
// router.post('/:id', getPropertyTypeListingById);
router.put('/:id',authorize, updatePropertyTypeListing);
router.delete('/:id',authorize, deletePropertyTypeListing);

export default router;
