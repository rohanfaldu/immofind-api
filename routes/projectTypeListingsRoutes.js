import express from 'express';
import {getProjectTypeList, createProjectTypeListing,checkProjectTypeListing, updateProjectTypeListing,deleteProjectTypeListing} from '../controllers/projectTypeListingsController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware

const router = express.Router();

router.post('/',authorize, getProjectTypeList);
router.post('/create',authorize, createProjectTypeListing);
router.put('/:ID',authorize, updateProjectTypeListing);
router.delete('/:ID',authorize, deleteProjectTypeListing);
router.post('/check',authorize, checkProjectTypeListing);

export default router;
