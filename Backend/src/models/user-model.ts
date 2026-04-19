import joi from "joi";
import { Document, model, Schema } from "mongoose";
import { ValidationError } from "./client-errors";
import { Role } from "./enums";

// Credentials DTO for login payloads (no passwordHash).
export class CredentialsModel {
    public email!: string;
    public password!: string;

    public constructor(credentials: CredentialsModel) {
        this.email = credentials.email;
        this.password = credentials.password;
    }

    private static schema = joi.object({
        email: joi.string().required().email().lowercase(),
        password: joi.string().required().min(4).max(100)
    });

    public validate(): void {
        const result = CredentialsModel.schema.validate(this);
        if (result.error) throw new ValidationError(result.error.message);
    }
}

// Registration DTO. Role is NEVER trusted from the client.
export class RegisterModel {
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public password!: string;

    public constructor(payload: RegisterModel) {
        this.firstName = payload.firstName;
        this.lastName = payload.lastName;
        this.email = payload.email;
        this.password = payload.password;
    }

    private static schema = joi.object({
        firstName: joi.string().required().min(2).max(30),
        lastName: joi.string().required().min(2).max(30),
        email: joi.string().required().email().lowercase(),
        password: joi.string().required().min(4).max(100)
    });

    public validate(): void {
        const result = RegisterModel.schema.validate(this);
        if (result.error) throw new ValidationError(result.error.message);
    }
}

// Mongoose document.
export interface IUserDocument extends Document {
    _id: any;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
    {
        firstName: { type: String, required: true, minlength: 2, maxlength: 30, trim: true },
        lastName: { type: String, required: true, minlength: 2, maxlength: 30, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: Object.values(Role), default: Role.User, required: true }
    },
    { timestamps: true, versionKey: false }
);

export const UserModel = model<IUserDocument>("User", userSchema);
