import express from 'express';
import { createAuthor, getAllAuthors, getAuthorById, updateAuthor, deleteAuthor} from '../controllers/authorController.js';
import { authorize } from '../middleware/authorization.js';

const router = express.Router();

// Routes
router.post('/create', authorize, createAuthor);
router.get('/get-all', authorize, getAllAuthors);
router.get('/get/:id', authorize, getAuthorById);
router.put('/update/:id', authorize, updateAuthor);
router.delete('/delete/:id', authorize, deleteAuthor);


export default router;
