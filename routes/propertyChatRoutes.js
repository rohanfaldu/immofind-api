import express from 'express';
import {createProjectChat} from '../controllers/projectChatController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware

const router = express.Router();

router.post('/create',authorize, createProjectChat);

export default router;
