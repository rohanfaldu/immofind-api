import express from 'express';
import { createAuthor, getAllAuthors, getAuthorById, updateAuthor, deleteAuthor} from '../controllers/authorController.js';
import { authorize } from '../middleware/authorization.js';

const router = express.Router();

// Routes
router.post('/create', authorize, createAuthor);
router.post('/getall', authorize, getAllAuthors);
router.post('/get/:id', authorize, getAuthorById);
router.post('/update/:id', authorize, updateAuthor);
router.delete('/delete/:id', authorize, deleteAuthor);


export default router;
