import express, { NextFunction, Request, Response, Router } from "express";
import { AiRecommendationRequest } from "../3-models/ai-question-model";
import { aiService } from "../4-services/ai-service";
import { securityMiddleware } from "../6-middleware/security-middleware";

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
