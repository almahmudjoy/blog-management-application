# 🧠 Blog REST API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![REST API](https://img.shields.io/badge/REST-API-FF6B6B?style=for-the-badge)

</div>

A secure blog management backend built with Node.js, Express.js, Sequelize, MySQL, and JWT authentication. This project demonstrates role-based access control, protected user workflows, public blog discovery, validation, and a clean REST API structure suitable for learning, portfolio work, and backend project submission.

This repository is designed to showcase a production-style backend flow with authentication, authorization, profile management, blog publishing, and public search/filter features.

---

## ✨ Project Overview

This API supports three access levels:

- Guest
- User
- Admin

It includes:
- user registration and login
- JWT-based authentication
- password hashing with bcryptjs
- role-based authorization
- profile and password management
- blog CRUD operations
- blog search and category filtering
- validation and security checks

## 🎯 Assignment Scope

This project fulfills the Blog Application REST API assignment by implementing:

- Admin, User, and Guest access levels
- MySQL `blogdb` database with `users` and `blogs` tables
- Authentication with hashed passwords and JWT tokens
- User profile, password, and account-status management
- Admin-only user management
- Owner/admin blog update and delete permissions
- Public blog listing, detail views, partial search, and category filtering
- Meaningful HTTP status codes for validation, authentication, authorization, conflicts, and missing records

---

## 🚀 Features Implemented

### Authentication
- User registration
- User login
- JWT token generation and validation
- Password hashing before store
- Duplicate email prevention
- Active/inactive account checks

### User Management
- Get own profile
- Update own profile
- Update password
- Admin can view all users
- Admin can view a specific user
- Admin can activate or deactivate users

### Blog Management
- Create blog posts
- Get all blogs
- Get a blog by ID
- Search blogs by title or content
- Filter blogs by category
- Update own blog
- Admin can update any blog
- Delete own blog
- Admin can delete any blog

### Security & Validation
- Protected routes with JWT middleware
- Role-based access control
- User ownership protection
- Passwords never exposed in responses
- Required field validation
- Email validation
- Minimum password length validation
- Blog title and content validation
- 401/403/404 error handling

---

## 🧩 Technology Stack

- Node.js
- Express.js
- MySQL
- JavaScript
- JWT
- bcryptjs
- mysql2
- Sequelize ORM
- dotenv
- cors
- Postman
- GitHub-ready project documentation

---

## 👥 Role Access Summary

### Guest
- View all blogs
- View blog by ID
- Search by title
- Filter by category

### User
- Register and login
- View own profile
- Update own profile
- Update own password
- Create blogs
- Update own blogs
- Delete own blogs

### Admin
- Login when the account is active
- View all users
- View user by ID
- Activate/deactivate users
- Create blogs
- Update any user blog
- Delete any user blog

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | /api/auth/register | Public | Register a new user |
| POST | /api/auth/login | Public | Login and receive JWT token |
| POST | /api/auth/forgot-password | Public | Request a password reset |
| PATCH | /api/auth/reset-password/:token | Public | Set a new password |

### User Routes

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | /api/users/profile | Authenticated user/admin | Get logged-in user's profile |
| PUT | /api/users/profile/update | Authenticated user/admin | Update profile |
| PATCH | /api/users/password | Authenticated user/admin | Update password |
| GET | /api/users | Admin | View all users |
| GET | /api/users/:id | Admin | View specific user |
| PATCH | /api/users/:id/status | Admin | Activate/deactivate user |

### Blog Routes

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | /api/blogs/create | Authenticated user/admin | Create blog |
| PUT | /api/blogs/update/:id | Authenticated user/admin | Update blog |
| PUT | /api/blogs/:id | Authenticated user/admin | Update blog (compatibility route) |
| GET | /api/blogs | Public | List blogs; optionally search with `title` and filter with `category` |
| GET | /api/blogs/:id | Public | Get blog by ID |
| DELETE | /api/blogs/delete/:id | Authenticated user/admin | Delete blog (documented route) |
| DELETE | /api/blogs/:id | Authenticated user/admin | Delete blog (assignment-compatible route) |

Blog search examples:

```text
GET /api/blogs?title=playwright
GET /api/blogs?category=Testing
GET /api/blogs?title=playwright&category=Testing
```

Public blog responses include only safe author fields: `id`, `firstname`, and `lastname`.

### Health Route

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | / | Public | API health check |
| GET | /api | Public | Check that the API is running |

---

## 🗄️ Database Setup

Use the SQL script in [database/schema.sql](database/schema.sql) to create the required `blogdb` database and tables. The application connects through Sequelize using the environment variables below.

```sql
CREATE DATABASE IF NOT EXISTS blogdb;
USE blogdb;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  role ENUM('user', 'admin') DEFAULT 'user',
  createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  blogTitle VARCHAR(255) NOT NULL,
  blog TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

To promote a user to admin manually:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blogdb
JWT_SECRET=your_super_secret_key
PORT=5000
```

---

## ▶️ Run the Project

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
npm start
```

### 3. Run in development mode

```bash
npm run dev
```

The server runs on:

```text
http://localhost:5000
```

---

## 📘 Postman Documentation

Published Postman documentation:

[View Blog REST API documentation](https://documenter.getpostman.com/view/53084089/2sBYAuSWMN)

Postman collection:

[Blog REST API.postman_collection.json](Blog%20REST%20API.postman_collection.json)

Postman environment:

[blogAPI.postman_environment.json](blogAPI.postman_environment.json)

Import both JSON files into Postman. Set `BASE_URL` to `http://localhost:5000`, then save the user and admin JWT values in `USER_TOKEN` and `ADMIN_TOKEN`.

The collection covers registration, user login, admin login, user management, profile management, password updates, blog CRUD, public search/filtering, and authorization test cases.

---

## 📁 Project Structure

```text
blog-rest-api/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── blogController.js
├── database/
│   └── schema.sql
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/
│   ├── association.js
│   ├── blog.model.js
│   └── user.model.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── blogRoutes.js
├── services/
│   └── auth.service.js
├── utils/
│   ├── auth.validators.js
│   └── generatetoken.js
├── .env
├── blogAPI.postman_environment.json
├── Blog REST API.postman_collection.json
├── .gitignore
├── package.json
├── server.js
├── README.md
└── package-lock.json
```

---

## 🧪 Response and Validation Notes

- Successful responses commonly use a `success` flag and a `data` object or array.
- Registration and blog creation return HTTP `201`.
- Invalid input returns HTTP `400`.
- Missing or invalid authentication returns HTTP `401`.
- Forbidden role or ownership actions return HTTP `403`.
- Missing users or blogs return HTTP `404`.
- Duplicate email registration returns HTTP `409`.
- Passwords are hashed before storage and excluded from API responses.
- A blog `userId` is taken from the authenticated JWT, not the request body.

## 🧪 Notes

This project is suitable for:
- REST API learning
- backend portfolio work
- JWT authentication practice
- MySQL + Express integration
- role-based application design
- QA/SDET-oriented API validation practice

---

## 👨‍💻 Author

Abdullah Al Mahmud Joy

Full Stack SDET — Road to SDET  
M.Sc. in Computer Science & Engineering, Military Institute of Science and Technology (MIST)  
B.Sc. in Computer Science & Engineering, Bangladesh University of Business and Technology (BUBT)

- GitHub: https://github.com/almahmudjoy
- LinkedIn: https://linkedin.com/in/abdullah-al-mahmud-joy

---

## ✅ Submission Status

This project reflects the actual implementation present in the repository: secure blog management, JWT authentication, role-based access control, user profile workflows, public blog search/filtering, database setup, and Postman documentation.

It is ready for academic submission, portfolio showcase, and practical backend API demonstration.

### Submission Checklist

- [x] Organized Node.js and Express project structure
- [x] `node_modules/` and `.env` excluded through `.gitignore`
- [x] Database schema included in `database/schema.sql`
- [x] Postman collection included in the repository
- [x] Postman environment included in the repository
- [x] Published Postman documentation linked above
- [x] README includes setup instructions and API reference
