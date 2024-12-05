import express from 'express';
import { createPropertyType,getPropertyTypes,updatePropertyType,deletePropertyType  } from '../controllers/propertyTypeController.js';

const router = express.Router();


// Route to create Property Type
router.post('/create', createPropertyType);
router.post('/', getPropertyTypes);
router.put('/:Id', updatePropertyType);
router.delete('/:Id', deletePropertyType );

export default router;
