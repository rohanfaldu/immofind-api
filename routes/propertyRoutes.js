import express from 'express';
import { getAllProperty, createProperty, unlikeProperty, getLikedProperty, likeProperty, updateProperty, getAgentDeveloperProperty, deleteProperty,statusUpdateProperty, getPropertyById, getPropertyByIdWithId, propertyComment, getPropertyComment} from '../controllers/propertyController.js';
import { authorize, optionalAuthenticate } from '../middleware/authorization.js'; // Import the authorization middleware
const router = express.Router();


// Routes
router.post('/', optionalAuthenticate, getAllProperty);
router.post('/getbyid', getPropertyById);
router.post('/getbyIds', authorize, getPropertyByIdWithId);
router.post('/agent-developer', authorize, getAgentDeveloperProperty);
router.post('/create', authorize,createProperty);
router.put('/:propertyId',authorize, updateProperty);
router.delete('/:propertyId',authorize, deleteProperty);
router.post('/statusUpdate', authorize, statusUpdateProperty);

router.post('/comment', authorize, propertyComment);
router.post('/getbycommentid', getPropertyComment);

router.post('/like', authorize, likeProperty);   // Like a property
router.delete('/:propertyId/like', authorize, unlikeProperty);
router.post('/get-liked-property', authorize, getLikedProperty);
// router.delete('/:propertyId/like', authorize, unlikeProperty);
export default router;
