import express from 'express';
import { getList, agenciesEngagement } from '../controllers/dashboardController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware

const router = express.Router();

// Define your routes here
router.post('/list', authorize, getList); // Protected route
router.post('/agencies-user-engagement', authorize, agenciesEngagement);

export default router;
