import express from 'express';
import { getAllProperty} from '../controllers/propertyController.js';
import passport from 'passport';
const router = express.Router();


// Routes
router.post('/', getAllProperty); // Get All States with Cities

export default router;
