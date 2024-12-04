import express from 'express';
import { getAllProjects,createProject, updateProject, deleteProject} from '../controllers/projectController.js';
import passport from 'passport';
const router = express.Router();


// Routes
router.post('/', getAllProjects);
router.post('/create', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
export default router;
