import express from 'express';
import * as blogController from '../controllers/blogController.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Protected Routes (User / Admin)
router.post('/create', authenticateToken, blogController.createBlog);

// Blog Updates
router.put('/update/:id', authenticateToken, blogController.updateBlog);
router.put('/:id', authenticateToken, blogController.updateBlog);

// Blog Deletions
router.delete('/delete/:id', authenticateToken, blogController.deleteBlog);
router.delete('/:id', authenticateToken, blogController.deleteBlog);

export default router;