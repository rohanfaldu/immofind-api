import express from 'express';
import { createPropertyType,getPropertyTypes } from '../controllers/propertyTypeController.js';

const router = express.Router();


// Route to create Property Type
router.post('/create', createPropertyType);
router.post('/', getPropertyTypes);

export default router;
