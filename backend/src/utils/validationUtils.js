export const MAX_NAME_LENGTH = 50;
export const MAX_PASSWORD_LENGTH = 128;

export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const sanitizeInput = (input, sanitize) => {
    return sanitize(input?.trim(), {
        allowedTags: [],
        allowedAttributes: {}
    });
}; 