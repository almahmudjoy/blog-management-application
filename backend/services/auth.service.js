import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { User } from "../models/association.js";

import { generateToken } from "../utils/generatetoken.js";

const createOtpHash = async (otp) => {
    return bcrypt.hash(String(otp), 10);
};

const sendOtpEmail = async (email, otp) => {
    if (process.env.NODE_ENV === "production") {
        const nodemailer = (await import("nodemailer")).default;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Your BlogSpace OTP",
            text: `Your OTP is: ${otp}. It expires in 2 minutes.`
        });
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    const nodemailer = (await import("nodemailer")).default;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${encodeURIComponent(resetToken)}`;

    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Reset your BlogSpace password",
        text: `Reset your password using this link: ${resetUrl}\n\nThis link expires in 15 minutes.`,
        html: `<p>Reset your BlogSpace password using the link below:</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 15 minutes.</p>`
    });
};


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

export const requestLoginOtp = async (email, password) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("Your account is deactivated.");
        error.statusCode = 401;
        throw error;
    }

    const isDemoAdmin = user.role === "admin" &&
        user.email === (process.env.ADMIN_EMAIL || "admin@example.com");
    const usesDevelopmentOtp = process.env.NODE_ENV === "development";
    const otp = isDemoAdmin
        ? (process.env.ADMIN_DEMO_OTP || "123456")
        : usesDevelopmentOtp
            ? (process.env.DEV_OTP || "123456")
            : String(Math.floor(100000 + Math.random() * 900000));

    const otpHash = await createOtpHash(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    user.otpHash = otpHash;
    user.otpExpiresAt = expiresAt;
    user.otpAttempts = 0;
    await user.save();

    if (!isDemoAdmin) {
        await sendOtpEmail(user.email, otp);
    }

    return {
        message: isDemoAdmin
            ? "Demo admin OTP generated. Please verify to continue."
            : "OTP sent to your email. Please verify to continue.",
        email: user.email,
        devOtp: isDemoAdmin || usesDevelopmentOtp ? otp : undefined,
        data: { email: user.email }
    };
};

export const verifyLoginOtp = async (email, otp) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    if (!user.otpHash || !user.otpExpiresAt) {
        const error = new Error("No OTP has been requested for this account.");
        error.statusCode = 400;
        throw error;
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
        user.otpHash = null;
        user.otpExpiresAt = null;
        user.otpAttempts = 0;
        await user.save();

        const error = new Error("Your OTP has expired. Please login again.");
        error.statusCode = 401;
        throw error;
    }

    if (user.otpAttempts >= 5) {
        user.otpHash = null;
        user.otpExpiresAt = null;
        user.otpAttempts = 0;
        await user.save();

        const error = new Error("Too many incorrect OTP attempts. Please login again.");
        error.statusCode = 401;
        throw error;
    }

    const isValidOtp = await bcrypt.compare(String(otp), user.otpHash);

    if (!isValidOtp) {
        user.otpAttempts = Number(user.otpAttempts || 0) + 1;
        await user.save();

        const error = new Error("Invalid OTP. Please try again.");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user);

    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

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

    if (process.env.NODE_ENV === "production") {
        await sendPasswordResetEmail(user.email, resetToken);
    } else {
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