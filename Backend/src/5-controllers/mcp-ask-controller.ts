import express, { NextFunction, Request, Response, Router } from "express";
import { McpQuestionRequest } from "../3-models/ai-question-model";
import { mcpAskService } from "../4-services/mcp-ask-service";
import { securityMiddleware } from "../6-middleware/security-middleware";

class McpAskController {

    public router: Router = express.Router();

    public constructor() {
        this.router.post("/api/mcp/ask", securityMiddleware.verifyToken, this.ask);
    }

    private ask = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const payload = new McpQuestionRequest(request.body);
            payload.validate();
            const result = await mcpAskService.ask(payload.question);
            response.json(result);
        } catch (err) {
            next(err);
        }
    };
}

export const mcpAskController = new McpAskController();
