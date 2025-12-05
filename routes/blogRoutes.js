// routes/blogRoutes.js
import express from "express";
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  toggleLike,
  addComment,
  deleteComment,
  getBlogStats
} from "../controllers/BlogController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ SPECIFIC ROUTES FIRST (these must come BEFORE /:id routes)
router.get("/my", authMiddleware, getMyBlogs);           // GET /api/blogs/my
router.get("/stats", authMiddleware, getBlogStats);      // GET /api/blogs/stats

// ✅ PUBLIC ROUTES
router.get("/", getBlogs);                               // GET /api/blogs

// ✅ PROTECTED ROUTES (require authentication)
router.post("/", authMiddleware, createBlog);            // POST /api/blogs

// ✅ ID-BASED ROUTES LAST (after all specific routes)
router.get("/:id", getBlog);                             // GET /api/blogs/:id
router.put("/:id", authMiddleware, updateBlog);          // PUT /api/blogs/:id
router.delete("/:id", authMiddleware, deleteBlog);       // DELETE /api/blogs/:id

// ✅ NESTED ID ROUTES
router.post("/:id/like", authMiddleware, toggleLike);    // POST /api/blogs/:id/like
router.post("/:id/comments", authMiddleware, addComment); // POST /api/blogs/:id/comments
router.delete("/:blogId/comments/:commentId", authMiddleware, deleteComment); // DELETE /api/blogs/:blogId/comments/:commentId

export default router;