import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/association.js";

import { generateToken } from "../utils/generatetoken.js";


// Register User
export const registerUser = async (
    firstname,
    lastname,
    email,
    password
) => {

    const existingUser = await User.findOne({
        where: {
            email
        }
    });

    if (existingUser) {
        const error = new Error("Email already exists.");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword
    });

    return {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        isActive: user.isActive,
        role: user.role
    };
};


// Login User
export const loginUser = async (
    email,
    password
) => {

    const user = await User.findOne({
        where: {
            email
        }
    });

    if (!user) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("Your account is deactivated.");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatched = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatched) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            isActive: user.isActive,
            role: user.role
        }
    };
};


const passwordResetMessage = "If the email exists, a password reset link has been sent.";

// A mail provider is outside this assignment, so expose the local reset token
// only outside production to make the complete flow testable with Postman.
export const requestPasswordReset = async (email) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        return { message: passwordResetMessage };
    }

    const resetToken = jwt.sign(
        { id: user.id, purpose: "password-reset" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const response = { message: passwordResetMessage };

    if (process.env.NODE_ENV !== "production") {
        response.resetToken = resetToken;
    }

    return response;
};


export const resetPassword = async (token, password) => {
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        const error = new Error("This reset link is invalid or has expired.");
        error.statusCode = 401;
        throw error;
    }

    if (decoded.purpose !== "password-reset") {
        const error = new Error("This reset link is invalid or has expired.");
        error.statusCode = 401;
        throw error;
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
        const error = new Error("This reset link is invalid or has expired.");
        error.statusCode = 401;
        throw error;
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
};