import express from 'express';
import { visitSchedule } from '../controllers/visitController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware
const router = express.Router();

router.post('/visit-schedule', authorize, visitSchedule);


export default router;
