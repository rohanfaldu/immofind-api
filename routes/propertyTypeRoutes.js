import express from 'express';
import { createPropertyType,getPropertyTypes,updatePropertyType,deletePropertyType  } from '../controllers/propertyTypeController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware

const router = express.Router();


// Route to create Property Type
router.post('/create',authorize, createPropertyType);
router.post('/', authorize,getPropertyTypes);
router.put('/:Id',authorize, updatePropertyType);
router.delete('/:Id',authorize, deletePropertyType );

export default router;
