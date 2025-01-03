import express from 'express';
import { getAllProjects, createProject, updateProject, deleteProject, getAgentDeveloperProjects, statusUpdateProject, getProjectsById, getProjectsByIdWithId } from '../controllers/projectController.js';
import passport from 'passport';
const router = express.Router();
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware


// Routes
router.post('/', getAllProjects);
router.post('/developer', authorize, getAgentDeveloperProjects);
router.post('/create', authorize, createProject);
router.put('/:id', authorize, updateProject);
router.delete('/:id', authorize, deleteProject);
router.post('/statusUpdate', authorize, statusUpdateProject);
router.post('/getbyid', getProjectsById);

router.post('/getbyIds', getProjectsByIdWithId);

export default router;
