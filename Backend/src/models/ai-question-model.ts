import joi from "joi";
import { ValidationError } from "./client-errors";

export class AiRecommendationRequest {
    public destination!: string;

    public constructor(payload: AiRecommendationRequest) {
        this.destination = payload.destination;
    }

    private static schema = joi.object({
        destination: joi.string().required().min(2).max(80)
    });

    public validate(): void {
        const result = AiRecommendationRequest.schema.validate(this);
        if (result.error) throw new ValidationError(result.error.message);
    }
}

export class McpQuestionRequest {
    public question!: string;

    public constructor(payload: McpQuestionRequest) {
        this.question = payload.question;
    }

    private static schema = joi.object({
        question: joi.string().required().min(3).max(400)
    });

    public validate(): void {
        const result = McpQuestionRequest.schema.validate(this);
        if (result.error) throw new ValidationError(result.error.message);
    }
}
