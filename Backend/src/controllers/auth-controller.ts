import express, { NextFunction, Request, Response, Router } from "express";
import { authService } from "../services/auth-service";
import { UnauthorizedError } from "../models/client-errors";
import { StatusCode } from "../models/enums";
import { CredentialsModel, RegisterModel } from "../models/user-model";
import { securityMiddleware } from "../middleware/security-middleware";

class AuthController {

    public router: Router = express.Router();

    public constructor() {
        this.router.post("/api/auth/register", this.register);
        this.router.post("/api/auth/login", this.login);
        this.router.get("/api/auth/me", securityMiddleware.verifyToken, this.me);
    }

    private register = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const payload = new RegisterModel(request.body);
            const result = await authService.register(payload);
            response.status(StatusCode.Created).json(result);
        } catch (err) {
            next(err);
        }
    };

    private login = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const credentials = new CredentialsModel(request.body);
            const result = await authService.login(credentials);
            response.json(result);
        } catch (err) {
            next(err);
        }
    };

    private me = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            if (!request.authUser) throw new UnauthorizedError("You are not logged in.");
            const fresh = await authService.getCurrentUser(request.authUser._id);
            if (!fresh) throw new UnauthorizedError("Account no longer exists.");
            response.json(fresh);
        } catch (err) {
            next(err);
        }
    };
}

export const authController = new AuthController();
