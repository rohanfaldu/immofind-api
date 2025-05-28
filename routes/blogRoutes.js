import express from 'express';
import { createBlog, editBlog, deleteBlog, getBlogDetailById, getBlogList, getBlogDetailSpecificId } from '../controllers/blogController.js';
import { authorize } from '../middleware/authorization.js';


const router = express.Router();

// Routes
router.post('/create', authorize, createBlog);
router.post('/edit/:id', authorize, editBlog);
router.delete('/delete/:id', authorize, deleteBlog);
router.post('/getbyid', getBlogDetailById);
router.post('/getall', getBlogList);
router.post('/get-blog-id', getBlogDetailSpecificId);

export default router;