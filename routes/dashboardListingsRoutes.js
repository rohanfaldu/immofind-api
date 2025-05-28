import express from 'express';
import { getList, agenciesEngagement, getLikes, getComments, getViews, getUserActivity } from '../controllers/dashboardController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware

const router = express.Router();

// Define your routes here
router.post('/list', authorize, getList); // Protected route
router.post('/agencies-user-engagement', authorize, agenciesEngagement);
router.post('/get-likes', authorize, getLikes);
router.post('/get-comments', authorize, getComments);
router.post('/get-views', authorize, getViews);
router.post('/get-all-activity', authorize, getUserActivity);
// router.post('/get-all-activity', authorize, getUserActivity);


export default router;
