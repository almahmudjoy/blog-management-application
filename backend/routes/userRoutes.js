import express from 'express';
import * as userController from '../controllers/userController.js';
import authenticateToken from '../middleware/authMiddleware.js';
import checkRole from '../middleware/roleMiddleware.js';
import uploadProfileImage from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Authenticated User Routes
router.get('/profile', authenticateToken, userController.getOwnProfile);
router.put('/profile/update', authenticateToken, userController.updateProfile);
router.patch('/profile/image',authenticateToken, uploadProfileImage.single("image"), userController.uploadProfileImage);
router.patch('/password', authenticateToken, userController.updatePassword);

// Admin-Only Routes
router.get('/', authenticateToken, checkRole('admin'), userController.getAllUsers);
router.get('/:id', authenticateToken, checkRole('admin'), userController.getUserById);
router.patch('/:id/status', authenticateToken, checkRole('admin'), userController.updateUserStatus);

export default router;