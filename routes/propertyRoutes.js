import express from 'express';
import { getAllProperty,createProperty, updateProperty, getAgentDeveloperProperty, deleteProperty} from '../controllers/propertyController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware
const router = express.Router();


// Routes
router.post('/', getAllProperty);
router.post('/agent-developer', authorize, getAgentDeveloperProperty);
router.post('/create', authorize,createProperty);
router.put('/:propertyId',authorize, updateProperty);
router.delete('/:propertyId',authorize, deleteProperty);
export default router;
