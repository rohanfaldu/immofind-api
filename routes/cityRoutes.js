import express from 'express';
import { createCity, getCities, getCitiesByState, getCitiesByStateId } from '../controllers/cityController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware

const router = express.Router();

// Define your routes here
router.post('/create', authorize, createCity); // Protected route
router.post('/all', authorize,getCities); // Public route (no authorization needed)
router.post('/', authorize, getCitiesByStateId); // Protected route
router.post('/search',authorize, getCitiesByState); // Public route (no authorization needed)

export default router;
