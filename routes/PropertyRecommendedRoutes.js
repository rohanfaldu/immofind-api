import express from 'express';
import { createPropertyRecommended, getRecommendedProperties } from '../controllers/PropertyRecommendedController.js';
import { authorize } from '../middleware/authorization.js';


const router = express.Router();

// Routes
router.post('/store', authorize, createPropertyRecommended);
router.post('/get', authorize, getRecommendedProperties)







export default router;