import express from 'express';
import { savePropertySaveSearches } from '../controllers/propertySaveSearchesController.js';
import { authorize } from '../middleware/authorization.js';
const router = express.Router();

router.post('/save', authorize, savePropertySaveSearches);

export default router;
