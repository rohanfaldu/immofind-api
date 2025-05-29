import express from 'express';
const router = express.Router();
import { getNotifications } from '../controllers/notificationController.js';
import { getChatMessages } from '../controllers/recentMessageController.js';


router.post('/get', getNotifications);
router.post('/get-chat', getChatMessages);

// router.put('/:id', );

export default router;
