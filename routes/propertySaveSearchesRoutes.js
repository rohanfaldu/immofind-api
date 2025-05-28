import express from 'express';
import { savePropertySaveSearches, getPropertySaveSearches } from '../controllers/propertySaveSearchesController.js';
import { authorize } from '../middleware/authorization.js';
const router = express.Router();

router.post('/save', authorize, savePropertySaveSearches);
//router.post('/getall', authorize, getPropertySaveSearches);

export default router;
