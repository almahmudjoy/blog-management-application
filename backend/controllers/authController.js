import {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPassword
} from "../services/auth.service.js";

import {
    isEmpty,
    validateEmail,
    validatePassword
} from "../utils/auth.validators.js";


export const register = async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            email,
            password
        } = req.body;

        if (
            isEmpty(firstname) ||
            isEmpty(lastname) ||
            isEmpty(email) ||
            isEmpty(password)
        ) {
            return res.status(400).json({
                message: "Firstname, lastname, email and password are required."
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Invalid email format."
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password must be between 6 and 12 characters."
            });
        }

        const user = await registerUser(
            firstname,
            lastname,
            email,
            password
        );

        return res.status(201).json({
            message: "User registered successfully.",
            data: user
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error."
        });
    }
};


export const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (
            isEmpty(email) ||
            isEmpty(password)
        ) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Invalid email format."
            });
        }

        const result = await loginUser(
            email,
            password
        );

        return res.status(200).json({
            message: "Login successful.",
            data: result
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error."
        });
    }
};


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (isEmpty(email)) {
            return res.status(400).json({
                message: "Email is required."
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address."
            });
        }

        const result = await requestPasswordReset(email);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error."
        });
    }
};


export const resetPasswordByToken = async (req, res) => {
    try {
        const { password } = req.body;

        if (isEmpty(password)) {
            return res.status(400).json({
                message: "Password is required."
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password must be between 6 and 12 characters."
            });
        }

        await resetPassword(req.params.token, password);

        return res.status(200).json({
            message: "Password successfully changed."
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error."
        });
    }
};