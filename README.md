# BlogSpace

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3.4-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.8-149ECA?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![REST API](https://img.shields.io/badge/REST-API-FF6B6B?style=for-the-badge)

**A complete Next.js blog management application powered by a JWT-secured REST API.**

</div>

BlogSpace is the frontend for the Blog REST API assignment. It provides a realistic blogging experience for guests, authenticated users, and administrators. All application data comes from the backend API: there are no mock blog lists, hardcoded users, static API results, or direct frontend database access.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Roles and Permissions](#roles-and-permissions)
- [Application Routes](#application-routes)
- [Backend API Integration](#backend-api-integration)
- [Validation and Security](#validation-and-security)
- [Screenshots](#screenshots)
- [Submission Notes](#submission-notes)

## Project Overview

The application is organized around two layouts:

| Layout | Includes |
| --- | --- |
| Public | Fixed navbar, main content, footer |
| Dashboard | Fixed navbar, responsive sidebar, main content |

The application supports:

- Public blog discovery, search, filtering, and details
- Registration, login, logout, and persistent authentication state
- Profile editing, profile-image upload, and password changes
- Blog creation, editing, deletion, and ownership protection
- Admin user management and cross-user blog management
- Friendly loading, error, confirmation, and empty states

## Features

### Guest Experience

- Browse blog cards loaded from `GET /api/blogs`
- Search by title or content
- Filter by category
- Combine search and category filters
- Read complete blog details
- See author names, dates, and available profile images
- Register and log in

### User Experience

- Persistent JWT authentication through React context and `localStorage`
- Protected dashboard routes
- Dashboard statistics and recent blogs
- Create, edit, and delete owned blogs
- Update first name and last name
- Upload a JPG, PNG, or WEBP profile image up to 2 MB
- See the updated avatar immediately in the navbar
- Change password
- Log out and clear the active session

### Admin Experience

- View all blogs
- Edit or delete any blog
- View all users
- View detailed user information
- Activate or deactivate user accounts
- Use the same protected profile and password workflows as regular users

## Technology Stack

| Purpose | Technology |
| --- | --- |
| Framework | Next.js 16.3.4 App Router |
| UI library | React 19.2.8 |
| Styling | Tailwind CSS 4.3.3 |
| HTTP | Native `fetch` through a shared API layer |
| State | React Context (`AuthContext`, `ToastContext`) |
| Backend | Node.js, Express.js, Sequelize, MySQL |
| Authentication | JWT and bcryptjs |
| API testing | Postman |

## Project Structure

```text
learn-nextjs/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── screenshots/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── docs/
│   └── screenshots/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   └── package.json
├── My Assignment Description/
├── .gitignore
└── README.md
```

Responsibilities are separated by layer: pages compose screens, components provide reusable UI, services own API contracts, contexts own application state, and `frontend/utils/api.js` is the only frontend module that calls `fetch`.

## Installation

### 1. Clone the repository

Clone this repository from GitHub, then open a terminal in the project directory:

```bash
cd learn-nextjs
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

Open a second terminal:

```bash
cd learn-nextjs/frontend
npm install
```

## Environment Variables

Do not commit real `.env` files. Copy the example files and replace placeholder values locally.

### Backend

```powershell
cd backend
Copy-Item .env.example .env
```

The backend `.env.example` defines:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blogdb
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
NODE_ENV=development
```

### Frontend

```powershell
cd frontend
Copy-Item .env.example .env.local
```

The frontend `.env.example` defines:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:5000
```

`NEXT_PUBLIC_API_URL` must include the `/api` suffix. `NEXT_PUBLIC_UPLOADS_URL` is optional and defaults to the backend origin derived from the API URL.

## Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

The API runs at `http://localhost:5000`.

### Start the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:3000`.

### Production build

```bash
cd frontend
npm run build
npm start
```

The backend also provides `npm start` for production-style server execution. Database setup instructions and API-specific commands are available in [backend/README.md](backend/README.md).

## Roles and Permissions

| Role | Permissions |
| --- | --- |
| Guest | Browse, search, filter, view details, register, log in |
| User | Manage own profile and blogs, upload an avatar, change password |
| Admin | All user permissions plus user management and any-user blog management |

Role-based UI is backed by server authorization. The frontend never exposes controls for changing a user's own `role` or `isActive`, and blog ownership is enforced by the backend.

## Application Routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Blog listing, search, and category filter |
| `/blogs/[id]` | Public | Blog details and author information |
| `/login` | Public | Login and forgot-password link |
| `/register` | Public | Account registration |
| `/forgot-password` | Public | Request a password reset |
| `/reset-password/[token]` | Public | Set a new password |
| `/dashboard` | User/Admin | Dashboard statistics and recent blogs |
| `/dashboard/blogs` | User/Admin | Own blogs or all blogs for admins |
| `/dashboard/blogs/create` | User/Admin | Create a blog |
| `/dashboard/blogs/[id]/edit` | User/Admin | Edit an owned or admin-managed blog |
| `/dashboard/profile` | User/Admin | Edit profile and upload avatar |
| `/dashboard/change-password` | User/Admin | Change password |
| `/admin/users` | Admin | Manage users and account status |

Unauthenticated access to protected routes redirects to `/login?next=...`. Normal users receive an `Access Denied` response when opening the admin area.

## Backend API Integration

The BlogSpace frontend consumes the provided backend API. All authenticated requests send `Authorization: Bearer <token>`, and blog creation never sends `userId`; the backend derives ownership from the JWT.

### Authentication

| Method | Endpoint | Used by |
| --- | --- | --- |
| POST | `/api/auth/register` | Registration |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Forgot-password form |
| PATCH | `/api/auth/reset-password/:token` | Reset-password form |

### Users

| Method | Endpoint | Used by |
| --- | --- | --- |
| GET | `/api/users` | Admin user list |
| GET | `/api/users/:id` | Admin user details |
| PATCH | `/api/users/:id/status` | Activate/deactivate user |
| GET | `/api/users/profile` | Auth state, navbar, profile |
| PUT | `/api/users/profile/update` | Profile editing |
| PATCH | `/api/users/profile/image` | Multipart avatar upload |
| PATCH | `/api/users/password` | Change password |

### Blogs

| Method | Endpoint | Used by |
| --- | --- | --- |
| POST | `/api/blogs/create` | Create blog |
| GET | `/api/blogs` | Homepage and blog lists |
| GET | `/api/blogs/:id` | Details and edit form |
| PUT | `/api/blogs/update/:id` | Update blog |
| DELETE | `/api/blogs/delete/:id` | Delete blog |

Blog filtering uses the assignment query contract:

```text
GET /api/blogs?title=playwright
GET /api/blogs?category=Testing
GET /api/blogs?title=playwright&category=Testing
```

The API layer normalizes response envelopes and backend field names. For example, backend `firstname`, `lastname`, `createAt`, and `updateAt` values are normalized for frontend use without leaking API-shape concerns into page components.

## Validation and Security

- Required fields, email format, password length, and password confirmation are validated on the frontend and backend.
- Blog title, category, and content are validated before submission and again by the backend.
- Profile images are checked for JPG/JPEG/PNG/WEBP type and a maximum size of 2 MB.
- Passwords are hashed with bcryptjs and never returned by the API.
- JWTs are persisted locally and revalidated through `GET /api/users/profile` after refresh.
- Invalid or expired sessions receive a `401`, clear the frontend session, and redirect to login.
- `403`, `404`, validation, conflict, and network errors are converted into user-facing messages.
- Blog update and delete permissions are enforced by ownership checks and admin authorization on the backend.
- Unknown API routes return JSON errors instead of Express HTML responses.

## Screenshots

Frontend screenshots of the working application are included in
[`docs/screenshots/`](docs/screenshots/). The folder contains the homepage,
blog details, login, registration, dashboard, My Blogs, Create Blog, Profile,
Change Password, and Admin Users captures listed in
[`docs/screenshots/README.md`](docs/screenshots/README.md).

Backend API and Postman evidence is available under
[`backend/screenshots/`](backend/screenshots/).

## Submission Notes

- Keep `.env` and `.env.local` files out of version control.
- Commit both `.env.example` files.
- Include the frontend screenshots under `docs/screenshots/`.
- Include the backend Postman collection and environment files.
- The backend API setup and Postman documentation are maintained in [backend/README.md](backend/README.md).
- The project uses the provided Blog REST API and does not access the database from the frontend.

## 👨‍💻 Author

Abdullah Al Mahmud Joy

Full Stack SDET — Road to SDET

M.Sc. in Computer Science & Engineering, Military Institute of Science and Technology (MIST)

B.Sc. in Computer Science & Engineering, Bangladesh University of Business and Technology (BUBT)

- GitHub: [https://github.com/almahmudjoy](https://github.com/almahmudjoy)
- LinkedIn: [https://linkedin.com/in/abdullah-al-mahmud-joy](https://linkedin.com/in/abdullah-al-mahmud-joy)

---
