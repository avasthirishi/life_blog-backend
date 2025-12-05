// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import blogRoutes from "./routes/blogRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/upload.js"; // Import upload routes
import { createDefaultAdmin } from "./Utils/createAdmin.js";
import contactRoutes from "./routes/contactRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://life-blog-backend.onrender.com"  // <-- replace with YOUR VERCEL URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


// Increase payload limits for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Serving static files from:', path.join(__dirname, 'uploads'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/blogs", blogRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes); // Add upload routes

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    uploadsDir: uploadsDir,
    uploadsExists: fs.existsSync(uploadsDir)
  });
});

// Test endpoint to check uploads directory
app.get("/api/uploads/test", (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({
      message: "Uploads directory accessible",
      path: uploadsDir,
      files: files.length,
      fileList: files.slice(0, 10) // Show first 10 files
    });
  } catch (error) {
    res.status(500).json({
      error: "Cannot access uploads directory",
      details: error.message
    });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler with multer error handling
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: "File too large. Maximum size is 5MB." 
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      error: "Too many files. Only one file allowed." 
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: "Unexpected field in file upload." 
    });
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: "CORS policy violation" 
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({ error: "Duplicate field value" });
  }

  // Default error response
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URL;

    if (!mongoUri) {
      throw new Error("MONGO_URL not found in environment variables");
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");

    await createDefaultAdmin();

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  await connectDB();
  
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Static files served at /uploads`);
  console.log(`Upload endpoint: /api/upload/image`);
});

};

startServer().catch(console.error);