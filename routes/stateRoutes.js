import express from 'express';
import { createState, getStates} from '../controllers/stateController.js';
import passport from 'passport';
const router = express.Router();


// Routes
router.post('/create', createState); // Create State
router.post('/', getStates); // Get All States with Cities

export default router;
