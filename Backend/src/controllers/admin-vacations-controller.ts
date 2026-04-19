import express, { NextFunction, Request, Response, Router } from "express";
import { UploadedFile } from "express-fileupload";
import { StatusCode } from "../models/enums";
import { VacationInputModel } from "../models/vacation-model";
import { adminVacationService } from "../services/admin-vacation-service";
import { securityMiddleware } from "../middleware/security-middleware";

class AdminVacationsController {

    public router: Router = express.Router();

    public constructor() {
        this.router.post("/api/admin/vacations", securityMiddleware.verifyAdmin, this.create);
        this.router.put("/api/admin/vacations/:id", securityMiddleware.verifyAdmin, this.update);
        this.router.delete("/api/admin/vacations/:id", securityMiddleware.verifyAdmin, this.remove);
    }

    private create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const image = this.extractImage(request);
            const payload = new VacationInputModel(request.body);
            const created = await adminVacationService.create(payload, image);
            response.status(StatusCode.Created).json(created);
        } catch (err) {
            next(err);
        }
    };

    private update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const image = this.extractImage(request);
            const payload = new VacationInputModel(request.body);
            const updated = await adminVacationService.update(String(request.params.id), payload, image);
            response.json(updated);
        } catch (err) {
            next(err);
        }
    };

    private remove = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            await adminVacationService.remove(String(request.params.id));
            response.sendStatus(StatusCode.NoContent);
        } catch (err) {
            next(err);
        }
    };

    private extractImage(request: Request): UploadedFile | undefined {
        const files = request.files;
        if (!files) return undefined;
        const file = (files as Record<string, UploadedFile | UploadedFile[]>).image;
        if (!file) return undefined;
        return Array.isArray(file) ? file[0] : file;
    }
}

export const adminVacationsController = new AdminVacationsController();
