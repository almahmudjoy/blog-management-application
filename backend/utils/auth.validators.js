export const isEmpty = (value) => {
    return value === undefined ||
           value === null ||
           String(value).trim() === "";
};


export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};


export const validatePassword = (password) => {
    return typeof password === "string" &&
           password.length >= 6 &&
           password.length <= 12;
};