import express from 'express';
import { getAllProjects,createProject, updateProject, deleteProject} from '../controllers/projectController.js';
import passport from 'passport';
const router = express.Router();
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware


// Routes
router.post('/',authorize, getAllProjects);
router.post('/create',authorize, createProject);
router.put('/:id',authorize, updateProject);
router.delete('/',authorize, deleteProject);
export default router;
