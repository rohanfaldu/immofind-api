import express from 'express';
import { getAllProperty,createProperty, updateProperty, deleteProperty} from '../controllers/propertyController.js';
import passport from 'passport';
const router = express.Router();


// Routes
router.post('/', getAllProperty);
router.post('/create', createProperty);
router.put('/:propertyId', updateProperty);
router.delete('/:propertyId', deleteProperty);
export default router;
