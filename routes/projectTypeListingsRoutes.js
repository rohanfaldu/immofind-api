import express from 'express';
import {getProjectTypeList, createProjectTypeListing,updateProjectTypeListing,deleteProjectTypeListing} from '../controllers/projectTypeListingsController.js';
const router = express.Router();

router.post('/', getProjectTypeList);
router.post('/create', createProjectTypeListing);
router.put('/:ID', updateProjectTypeListing);
router.delete('/:ID', deleteProjectTypeListing);


export default router;
