import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Request } from "express";
import { appConfig } from "./app-config";
import { Role } from "../3-models/enums";

export interface TokenUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
}

interface TokenPayload {
    user: TokenUser;
}

class Cyber {

    // New passwords use bcrypt. The legacy HMAC path exists only to migrate
    // already-seeded local users without breaking logins during the upgrade.
    public async hash(plainText: string): Promise<string> {
        return bcrypt.hash(plainText, appConfig.bcryptRounds);
    }

    public async verifyPassword(plainText: string, passwordHash: string): Promise<{ isValid: boolean; shouldUpgrade: boolean }> {
        if (!passwordHash) {
            return { isValid: false, shouldUpgrade: false };
        }

        if (this.isBcryptHash(passwordHash)) {
            const isValid = await bcrypt.compare(plainText, passwordHash);
            return {
                isValid,
                shouldUpgrade: isValid && this.isWeakBcryptHash(passwordHash)
            };
        }

        const isValid = this.hashLegacy(plainText) === passwordHash;
        return {
            isValid,
            shouldUpgrade: isValid
        };
    }

    public generateToken(user: TokenUser): string {
        const payload: TokenPayload = { user };
        const options: SignOptions = { expiresIn: "3h" };
        return jwt.sign(payload, appConfig.jwtSecret, options);
    }

    public extractToken(request: Request): string {
        const authorization = request.headers.authorization;
        if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) return "";
        return authorization.substring(7).trim();
    }

    public verifyToken(token: string): boolean {
        if (!token) return false;
        try {
            jwt.verify(token, appConfig.jwtSecret);
            return true;
        } catch {
            return false;
        }
    }

    public decodeToken(token: string): TokenUser | null {
        try {
            if (!token) return null;
            jwt.verify(token, appConfig.jwtSecret);
            const payload = jwt.decode(token) as TokenPayload | null;
            return payload?.user ?? null;
        } catch {
            return null;
        }
    }

    public isAdmin(token: string): boolean {
        const user = this.decodeToken(token);
        return user?.role === Role.Admin;
    }

    public getUserId(token: string): string {
        const user = this.decodeToken(token);
        return user?._id ?? "";
    }

    private hashLegacy(plainText: string): string {
        return crypto
            .createHmac("sha512", appConfig.hashSalt)
            .update(plainText)
            .digest("hex");
    }

    private isBcryptHash(passwordHash: string): boolean {
        return passwordHash.startsWith("$2a$") || passwordHash.startsWith("$2b$") || passwordHash.startsWith("$2y$");
    }

    private isWeakBcryptHash(passwordHash: string): boolean {
        const rounds = Number(passwordHash.split("$")[2]);
        return Number.isInteger(rounds) && rounds < appConfig.bcryptRounds;
    }
}

export const cyber = new Cyber();
