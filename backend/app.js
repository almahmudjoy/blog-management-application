import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const otpRequestLimiter = rateLimit({
    windowMs: isProduction ? 15 * 60 * 1000 : 60 * 1000,
    max: isProduction ? 5 : 20,
    skip: (req) =>
        req.body?.email?.trim().toLowerCase() ===
        (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase(),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many OTP requests. Please try again later."
    }
});

const otpVerificationLimiter = rateLimit({
    windowMs: isProduction ? 10 * 60 * 1000 : 2 * 60 * 1000,
    max: isProduction ? 10 : 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many OTP attempts. Please try again later."
    }
});

app.use("/api/auth/login", otpRequestLimiter);
app.use("/api/auth/verify-otp", otpVerificationLimiter);
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);

app.get("/api", (req, res) => {
    res.status(200).json({
        message: "Blog REST API is running"
    });
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Blog REST API is running"
    });
});

app.use("/api", (req, res) => {
    res.status(404).json({
        message: "API endpoint not found."
    });
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message: "Profile image must be 2 MB or smaller."
            });
        }

        return res.status(400).json({
            message: "The uploaded profile image could not be processed."
        });
    }

    if (error?.message === "Only JPG, JPEG, PNG and WEBP images are allowed.") {
        return res.status(400).json({
            message: error.message
        });
    }

    console.error("Unhandled API error:", error);
    return res.status(error?.statusCode || 500).json({
        message: "Internal server error."
    });
});

export default app;