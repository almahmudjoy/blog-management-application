import express from "express";
import cors from "cors";
import multer from "multer";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

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