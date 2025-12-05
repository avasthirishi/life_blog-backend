# 🚀 LifeBlog Backend API

RESTful API for LifeBlog - A full-stack blogging platform built with Node.js, Express, and MongoDB.

---

## 🌐 Live API

**Base URL:** [https://life-blog-backend.onrender.com/api](https://life-blog-backend.onrender.com/api)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#️-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📝 **Blog CRUD Operations** - Create, read, update, and delete blogs
- 🖼️ **Image Upload** - Multer integration with Cloudinary storage
- 👤 **User Management** - Profile management and user-specific blogs
- 💬 **Comments & Likes** - Interactive blog engagement features
- 🛡️ **Protected Routes** - Middleware-based authentication
- 📧 **Contact Form** - Message submission and storage
- ⚡ **Input Validation** - Request validation and sanitization
- 🔒 **Password Hashing** - bcrypt for secure password storage
- 🌐 **CORS Enabled** - Cross-origin resource sharing configured

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcrypt
- **File Upload:** Multer
- **Cloud Storage:** Cloudinary SDK
- **Environment Variables:** dotenv
- **Security:** cors, helmet (optional)

---

## 📂 Project Structure

```
backend/
│
├── config/
│   └── cloudinary.js          # Cloudinary configuration
│
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── blogController.js      # Blog CRUD operations
│   └── contactController.js   # Contact form handler
│
├── middleware/
│   ├── authMiddleware.js      # JWT verification
│   └── uploadMiddleware.js    # Multer configuration
│
├── models/
│   ├── User.js                # User schema
│   ├── Blog.js                # Blog schema
│   └── Contact.js             # Contact schema
│
├── routes/
│   ├── authRoutes.js          # Auth endpoints
│   ├── blogRoutes.js          # Blog endpoints
│   ├── contactRoutes.js       # Contact endpoints
│   └── upload.js              # Upload endpoints
│
├── Utils/
│   └── createAdmin.js         # Default admin creation
│
├── uploads/
│   └── images/                # Temporary upload directory
│
├── .env                       # Environment variables
├── .gitignore                 # Git ignore file
├── index.js                   # Application entry point
├── package.json               # Dependencies
└── README.md                  # Documentation
```

---

## 🔧 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for image storage)

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/life_blog.git
cd life_blog/backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env` file**

```bash
touch .env
```

4. **Configure environment variables** (see below)

5. **Start the server**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

---

## ⚙️ Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/lifeblog?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Default Admin (Optional)
ADMIN_EMAIL=admin@lifeblog.com
ADMIN_PASSWORD=AdminPassword123
```

### 🔑 Getting Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret

### 🔑 Getting MongoDB URL

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string and replace `<password>` with your database password

---

## 🔗 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login user | ❌ |
| `GET` | `/api/auth/profile` | Get user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update profile | ✅ |

### Blog Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/blogs` | Get all blogs | ❌ |
| `GET` | `/api/blogs/:id` | Get single blog | ❌ |
| `POST` | `/api/blogs` | Create new blog | ✅ |
| `PUT` | `/api/blogs/:id` | Update blog | ✅ |
| `DELETE` | `/api/blogs/:id` | Delete blog | ✅ |
| `GET` | `/api/blogs/my` | Get user's blogs | ✅ |
| `POST` | `/api/blogs/:id/like` | Toggle like | ✅ |
| `POST` | `/api/blogs/:id/comments` | Add comment | ✅ |
| `DELETE` | `/api/blogs/:id/comments/:commentId` | Delete comment | ✅ |

### Upload Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/upload/image` | Upload image | ✅ |

### Contact Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/contact` | Submit contact form | ❌ |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/health` | API health status | ❌ |

---

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

### Registration

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Using Protected Routes

Include the JWT token in the Authorization header:

```bash
GET /api/blogs/my
Authorization: Bearer your_jwt_token_here
```

---

## 📝 Example API Requests

### Create a Blog

```bash
POST /api/blogs
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "title": "My First Blog Post",
  "content": "This is the content of my blog...",
  "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/blog-image.jpg",
  "category": "Technology"
}
```

### Upload an Image

```bash
POST /api/upload/image
Authorization: Bearer your_jwt_token
Content-Type: multipart/form-data

FormData:
  image: [binary file]
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/uploaded-image.jpg"
}
```

### Get All Blogs

```bash
GET /api/blogs?page=1&limit=10&category=Technology
```

**Response:**
```json
{
  "blogs": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalBlogs": 50
}
```

---

## ⚠️ Error Handling

The API uses standard HTTP status codes:

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (authentication required) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `500` | Internal Server Error |

**Error Response Format:**

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## 🚀 Deployment

### Deploy to Render

1. **Create a Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

3. **Add Environment Variables**
   - Add all variables from your `.env` file
   - Set `NODE_ENV=production`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set MONGO_URL=your_mongo_url
railway variables set JWT_SECRET=your_jwt_secret
# ... add all other variables

# Deploy
railway up
```

---

## 🧪 Testing

### Test API Health

```bash
curl https://life-blog-backend.onrender.com/api/health
```

### Test Authentication

```bash
# Register
curl -X POST https://life-blog-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","email":"test@example.com","password":"Test123"}'

# Login
curl -X POST https://life-blog-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'
```

---

## 🔒 Security Best Practices

- ✅ JWT tokens for authentication
- ✅ bcrypt password hashing (10 salt rounds)
- ✅ CORS configured for specific origins
- ✅ Input validation and sanitization
- ✅ Protected routes with middleware
- ✅ Environment variables for sensitive data
- ✅ Rate limiting (recommended for production)
- ✅ Helmet.js for security headers (recommended)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Rishikesh Kumar**  
Full-Stack Developer

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Rishikesh Kumar](https://linkedin.com/in/yourprofile)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Express.js for the robust web framework
- MongoDB for the flexible NoSQL database
- Cloudinary for seamless image hosting
- JWT for secure authentication
- The open-source community

---

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Contact via email: your.email@example.com
- Connect on LinkedIn

---

**⭐ If you find this project helpful, please consider giving it a star on GitHub!**
