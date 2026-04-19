import express, { NextFunction, Request, Response, Router } from "express";
import { AiRecommendationRequest } from "../models/ai-question-model";
import { aiService } from "../services/ai-service";
import { securityMiddleware } from "../middleware/security-middleware";

class AiController {

    public router: Router = express.Router();

    public constructor() {
        this.router.post("/api/ai/recommendation", securityMiddleware.verifyToken, this.recommend);
    }

    private recommend = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const payload = new AiRecommendationRequest(request.body);
            payload.validate();
            const text = await aiService.recommendDestination(payload.destination);
            response.json({ text });
        } catch (err) {
            next(err);
        }
    };
}

export const aiController = new AiController();
