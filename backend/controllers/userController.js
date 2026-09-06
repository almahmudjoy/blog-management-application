import { User } from "../models/association.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 12;

// Get all users - Admin only
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ["password"] }
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};


// Get user by ID - Admin only
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ["password"] }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};


// Activate / Deactivate user - Admin only
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be true or false."
            });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        await user.update({
            isActive
        });

        return res.status(200).json({
            message: isActive
                ? "User activated successfully."
                : "User deactivated successfully."
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};


// Get own profile - User/Admin
const getOwnProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};


// Update own profile - User/Admin
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstname, lastname, email, role, isActive } = req.body;

        // User cannot change their role
        if (role !== undefined || isActive !== undefined) {
            return res.status(403).json({
                message: "You cannot change your role or isActive."
            });
        }

        // User cannot change their email
        if (email !== undefined && email !== req.user.email) {
            return res.status(403).json({
                message: "You cannot change your email."
            });
        }

        // Validate required fields
        if (!firstname || !lastname) {
            return res.status(400).json({
                message: "Firstname and lastname are required."
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        await user.update({
            firstname,
            lastname
        });

        return res.status(200).json({
            message: "Profile updated successfully."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};


// Update own password - User/Admin
const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        // Validate password
        if (!password) {
            return res.status(400).json({
                message: "Password is required."
            });
        }

        if (
            password.length < MIN_PASSWORD_LENGTH ||
            password.length > MAX_PASSWORD_LENGTH
        ) {
            return res.status(400).json({
                message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long.`
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        await user.update({
            password: hashedPassword
        });

        return res.status(200).json({
            message: "Password updated successfully."
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};

const uploadProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check image
        if (!req.file) {
            return res.status(400).json({
                message: "Profile image is required."
            });
        }

        // Find logged-in user
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // Delete previous profile image
        if (user.profileImage) {

            const oldImagePath = path.join(
                process.cwd(),
                user.profileImage.replace(/^\/+/, "")
            );

            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // New image path
        const imagePath =
            `/uploads/profile/${req.file.filename}`;

        // Save image path in database
        await user.update({
            profileImage: imagePath
        });

        return res.status(200).json({
            message: "Profile image uploaded successfully.",
            profileImage: imagePath
        });

    } catch (error) {

        console.error("Profile image upload error:", error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};




export {
    getAllUsers,
    getUserById,
    updateUserStatus,
    getOwnProfile,
    updateProfile,
    updatePassword,
    uploadProfileImage
};
