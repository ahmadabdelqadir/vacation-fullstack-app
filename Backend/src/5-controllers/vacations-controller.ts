import express, { NextFunction, Request, Response, Router } from "express";
import fs from "fs";
import { fileSaver } from "uploaded-file-saver";
import { appConfig } from "../2-utils/app-config";
import { VacationFilter } from "../3-models/enums";
import { vacationService } from "../4-services/vacation-service";
import { likeService } from "../4-services/like-service";
import { securityMiddleware } from "../6-middleware/security-middleware";

class VacationsController {

    public router: Router = express.Router();

    public constructor() {
        this.router.get("/api/vacations/images/:imageName", this.getImage);
        this.router.get("/api/vacations", securityMiddleware.verifyToken, this.list);
        this.router.get("/api/vacations/:id", securityMiddleware.verifyToken, this.one);

        this.router.post("/api/vacations/:id/like", securityMiddleware.verifyToken, this.like);
        this.router.delete("/api/vacations/:id/like", securityMiddleware.verifyToken, this.unlike);
    }

    // Note: authUser is guaranteed by securityMiddleware.verifyToken.
    // The non-null assertion (!) is safe because the middleware calls next()
    // only after setting request.authUser.

    private list = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const page = Math.max(1, parseInt(String(request.query.page ?? "1"), 10) || 1);
            const pageSize = Math.max(
                1,
                Math.min(100, parseInt(String(request.query.limit ?? appConfig.vacationsPerPage), 10) || appConfig.vacationsPerPage)
            );
            const filter = this.parseFilter(request.query.filter);

            const result = await vacationService.list({
                page,
                pageSize,
                filter,
                userId: request.authUser!._id
            });
            response.json(result);
        } catch (err) {
            next(err);
        }
    };

    private one = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const item = await vacationService.getById(String(request.params.id), request.authUser!._id);
            response.json(item);
        } catch (err) {
            next(err);
        }
    };

    private like = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await likeService.like(String(request.params.id), request.authUser!);
            response.json(result);
        } catch (err) {
            next(err);
        }
    };

    private unlike = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await likeService.unlike(String(request.params.id), request.authUser!);
            response.json(result);
        } catch (err) {
            next(err);
        }
    };

    private getImage = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const imageName = String(request.params.imageName ?? "");
            const filePath = fileSaver.getFilePath(imageName);
            if (!filePath || !fs.existsSync(filePath)) {
                response.status(404).json({ message: "Image not found." });
                return;
            }
            response.sendFile(filePath);
        } catch (err) {
            next(err);
        }
    };

    private parseFilter(raw: unknown): VacationFilter {
        const value = String(raw ?? "").toLowerCase();
        const known: Record<string, VacationFilter> = {
            [VacationFilter.All]: VacationFilter.All,
            [VacationFilter.Liked]: VacationFilter.Liked,
            [VacationFilter.Active]: VacationFilter.Active,
            [VacationFilter.Upcoming]: VacationFilter.Upcoming
        };
        return known[value] ?? VacationFilter.All;
    }
}

export const vacationsController = new VacationsController();
