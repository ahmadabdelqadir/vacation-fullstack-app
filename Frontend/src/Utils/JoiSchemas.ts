import Joi from "joi";

export const registerSchema = Joi.object({
    firstName: Joi.string().required().min(2).max(30).messages({
        "string.empty": "First name is required.",
        "string.min": "First name must be at least {#limit} characters."
    }),
    lastName: Joi.string().required().min(2).max(30).messages({
        "string.empty": "Last name is required.",
        "string.min": "Last name must be at least {#limit} characters."
    }),
    email: Joi.string()
        .required()
        .email({ tlds: { allow: false } })
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Please enter a valid email address."
        }),
    password: Joi.string().required().min(4).max(100).messages({
        "string.empty": "Password is required.",
        "string.min": "Password must be at least {#limit} characters."
    })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .required()
        .email({ tlds: { allow: false } })
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Please enter a valid email address."
        }),
    password: Joi.string().required().min(4).max(100).messages({
        "string.empty": "Password is required.",
        "string.min": "Password must be at least {#limit} characters."
    })
});

export const vacationSchema = Joi.object({
    destination: Joi.string().required().min(2).max(100),
    description: Joi.string().required().min(5).max(2000),
    continent: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required().min(Joi.ref("startDate")).messages({
        "date.min": "End date cannot be earlier than start date."
    }),
    price: Joi.number().required().min(0).max(10000).messages({
        "number.max": "Price cannot exceed {#limit}.",
        "number.min": "Price cannot be negative."
    }),
    image: Joi.any().optional()
});
