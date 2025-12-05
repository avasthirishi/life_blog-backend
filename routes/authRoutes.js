// routes/authRoutes.js
import express from 'express';
import { 
  signup, 
  login, 
  getProfile, 
  updateProfile,
  getAllUsers,
  toggleUserStatus,
  changeUserRole
} from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/api/auth/signup', signup);
router.post('/api/auth/login', login);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.patch('/users/:userId/status', authenticateToken, requireAdmin, toggleUserStatus);
router.patch('/users/:userId/role', authenticateToken, requireAdmin, changeUserRole);

export default router;