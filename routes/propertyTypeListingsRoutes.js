import express from 'express';
import { getAllPropertyTypeListings, checkProjectTypeListing, createPropertyTypeListing,updatePropertyTypeListing,deletePropertyTypeListing,statusUpdatePropertyTypeListing, getPropertyTypeListingById} from '../controllers/propertyTypeListingsController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware
const router = express.Router();

router.post('/', getAllPropertyTypeListings);
router.post('/getbyid',authorize, getPropertyTypeListingById);
router.post('/create',authorize, createPropertyTypeListing);
// router.post('/:id', getPropertyTypeListingById);
router.put('/:id',authorize, updatePropertyTypeListing);
router.delete('/:id',authorize, deletePropertyTypeListing);
router.post('/check',authorize, checkProjectTypeListing);
router.post('/statusUpdate',authorize, statusUpdatePropertyTypeListing);

export default router;
