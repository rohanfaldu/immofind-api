// cityRoutes.js
import express from 'express';
import { createCity, getCities, getCitiesByState} from '../controllers/cityController.js';
//import passport from 'passport';
const router = express.Router();

// Define your routes here
router.post('/create', createCity);
router.post('/', getCities);
router.post('/search', getCitiesByState);

export default router;