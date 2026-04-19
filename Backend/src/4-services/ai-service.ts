import OpenAI from "openai";
import striptags from "striptags";
import { appConfig } from "../2-utils/app-config";
import { ValidationError } from "../3-models/client-errors";

class AiService {

    private client: OpenAI | null = null;

    public get isConfigured(): boolean {
        return !!appConfig.aiApiKey;
    }

    public async recommendDestination(destination: string): Promise<string> {
        if (!this.isConfigured) {
            throw new ValidationError("AI provider is not configured on the server.");
        }
        const client = this.getClient();
        const safeDestination = striptags(destination).trim().slice(0, 80);

        const response = await client.chat.completions.create({
            model: appConfig.aiModel,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a concise travel expert. For the destination the user names, reply with up to 120 words: 3 unmissable highlights as a short list, 1 pro tip about the best time to visit, and one local phrase with translation. Keep the tone warm and practical."
                },
                { role: "user", content: `Recommend a short travel plan for: ${safeDestination}.` }
            ],
            max_tokens: 300,
            temperature: 0.7
        });

        return response.choices[0]?.message?.content?.trim() ?? "";
    }

    // Asks OpenAI a question while giving it access to our MCP server.
    // Only used when MCP_PUBLIC_URL is set; otherwise the in-process router handles it.
    public async answerViaRemoteMcp(question: string, mcpUrl: string): Promise<string> {
        if (!this.isConfigured) {
            throw new ValidationError("AI provider is not configured on the server.");
        }
        const client = this.getClient();
        const safeQuestion = striptags(question).trim().slice(0, 400);

        // The SDK typings don't include the "mcp" tool shape yet, so we build it by hand.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mcpTool: any = {
            type: "mcp",
            server_label: "VacationsMCP",
            server_description: "MCP server exposing vacation data tools.",
            server_url: mcpUrl,
            require_approval: "never"
        };

        const response = await client.responses.create({
            model: appConfig.aiModel,
            tools: [mcpTool],
            input: safeQuestion
        });

        return response.output_text?.trim() ?? "";
    }

    public async summarize(question: string, toolName: string, data: unknown): Promise<string> {
        if (!this.isConfigured) {
            return JSON.stringify(data);
        }
        const client = this.getClient();
        const response = await client.chat.completions.create({
            model: appConfig.aiModel,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful analyst. Given a user question and the JSON result of a database tool, answer in one or two short sentences. Use numbers from the data verbatim. If the data is a list, mention counts and a few representative items."
                },
                {
                    role: "user",
                    content: `Question: ${striptags(question)}\nTool used: ${toolName}\nTool result JSON:\n${JSON.stringify(data).slice(0, 6000)}`
                }
            ],
            max_tokens: 220,
            temperature: 0.3
        });
        return response.choices[0]?.message?.content?.trim() ?? JSON.stringify(data);
    }

    private getClient(): OpenAI {
        if (!this.client) {
            this.client = new OpenAI({ apiKey: appConfig.aiApiKey });
        }
        return this.client;
    }
}

export const aiService = new AiService();
