import express from 'express';
import {getProjectTypeList, createProjectTypeListing} from '../controllers/projectTypeListingsController.js';
const router = express.Router();

router.post('/', getProjectTypeList);
router.post('/create', createProjectTypeListing);


export default router;
