import express from 'express';
import { createBlog, editBlog, deleteBlog, getBlogDetailById, getBlogList } from '../controllers/blogController.js';
import { authorize } from '../middleware/authorization.js';


const router = express.Router();

// Routes
router.post('/create', authorize, createBlog);
router.post('/edit/:id', authorize, editBlog);
router.post('/delete/:id', authorize, deleteBlog);
router.post('/getbyid', authorize, getBlogDetailById);
router.post('/index', authorize, getBlogList);






export default router;