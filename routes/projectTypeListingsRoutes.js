import express from 'express';
import {getProjectTypeList, createProjectTypeListing, getProjectTypeListAll, checkProjectTypeListing, updateProjectTypeListing,deleteProjectTypeListing} from '../controllers/projectTypeListingsController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware

const router = express.Router();

router.post('/',authorize, getProjectTypeList);
router.post('/all',authorize, getProjectTypeListAll);
router.post('/create',authorize, createProjectTypeListing);
router.put('/:id',authorize, updateProjectTypeListing);
router.delete('/:id',authorize, deleteProjectTypeListing);
router.post('/check',authorize, checkProjectTypeListing);

export default router;
