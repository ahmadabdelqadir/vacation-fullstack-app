import express, { NextFunction, Request, Response, Router } from "express";
import { reportService } from "../4-services/report-service";
import { securityMiddleware } from "../6-middleware/security-middleware";

class ReportsController {

    public router: Router = express.Router();

    public constructor() {
        this.router.get(
            "/api/admin/reports/vacations-likes",
            securityMiddleware.verifyAdmin,
            this.json
        );
        this.router.get(
            "/api/admin/reports/vacations-likes/csv",
            securityMiddleware.verifyAdmin,
            this.csv
        );
    }

    private json = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const rows = await reportService.getLikesByDestination();
            response.json(rows);
        } catch (err) {
            next(err);
        }
    };

    private csv = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const body = await reportService.getLikesByDestinationCsv();
            response.setHeader("Content-Type", "text/csv; charset=utf-8");
            response.setHeader(
                "Content-Disposition",
                'attachment; filename="vacation-likes-report.csv"'
            );
            response.send(body);
        } catch (err) {
            next(err);
        }
    };
}

export const reportsController = new ReportsController();
