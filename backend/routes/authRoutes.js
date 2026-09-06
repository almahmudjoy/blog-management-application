import express from "express";

import {
    register,
    login,
    forgotPassword,
    resetPasswordByToken
} from "../controllers/authController.js";

const router = express.Router();


// POST /api/auth/register
router.post("/register", register);


// POST /api/auth/login
router.post("/login", login);


// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);


// PATCH /api/auth/reset-password/:token
router.patch("/reset-password/:token", resetPasswordByToken);


export default router;