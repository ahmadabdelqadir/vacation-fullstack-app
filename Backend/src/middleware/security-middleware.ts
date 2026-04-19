import { NextFunction, Request, Response } from "express";
import striptags from "striptags";
import { cyber, TokenUser } from "../utils/cyber";
import { ForbiddenError, UnauthorizedError } from "../models/client-errors";
import { Role } from "../models/enums";

// Attach the decoded user onto the request for downstream handlers.
declare module "express-serve-static-core" {
    interface Request {
        authUser?: TokenUser;
    }
}

class SecurityMiddleware {

    // Pulls the JWT off the request, verifies it, and attaches the decoded
    // user to request.authUser. Returns null (and forwards a 401) if anything fails.
    private authenticateRequest(request: Request, next: NextFunction): TokenUser | null {
        const token = cyber.extractToken(request);
        if (!cyber.verifyToken(token)) {
            next(new UnauthorizedError("You are not logged in."));
            return null;
        }
        const user = cyber.decodeToken(token);
        if (!user) {
            next(new UnauthorizedError("Invalid token."));
            return null;
        }
        request.authUser = user;
        return user;
    }

    /** Any authenticated user. */
    public verifyToken = (request: Request, _response: Response, next: NextFunction): void => {
        if (this.authenticateRequest(request, next)) next();
    };

    /** Admin role only. */
    public verifyAdmin = (request: Request, _response: Response, next: NextFunction): void => {
        const user = this.authenticateRequest(request, next);
        if (!user) return;
        if (user.role !== Role.Admin) {
            next(new ForbiddenError("Admin access required."));
            return;
        }
        next();
    };

    /** Regular-user role only (e.g. liking). */
    public verifyUserRole = (request: Request, _response: Response, next: NextFunction): void => {
        const user = this.authenticateRequest(request, next);
        if (!user) return;
        if (user.role !== Role.User) {
            next(new ForbiddenError("Only regular users can perform this action."));
            return;
        }
        next();
    };

    // Password fields are skipped. If we stripped characters from a password
    // here, the hash stored at register time wouldn't match the typed password
    // at login time, and the user would be locked out for no reason.
    private readonly xssSkipFields = new Set<string>(["password", "passwordHash", "currentPassword", "newPassword"]);

    /** Strip HTML tags from string body fields (except passwords). */
    public preventXss = (request: Request, _response: Response, next: NextFunction): void => {
        this.sanitizeObject(request.body);
        next();
    };

    private sanitizeObject(obj: unknown): void {
        if (!obj || typeof obj !== "object") return;
        for (const key of Object.keys(obj as Record<string, unknown>)) {
            if (this.xssSkipFields.has(key)) continue;
            const value = (obj as Record<string, unknown>)[key];
            if (typeof value === "string") {
                (obj as Record<string, string>)[key] = striptags(value);
            } else if (typeof value === "object" && value !== null) {
                this.sanitizeObject(value);
            }
        }
    };
}

export const securityMiddleware = new SecurityMiddleware();
