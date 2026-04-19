import { appConfig } from "../Utils/AppConfig";
import { http } from "./HttpService";

export interface McpAskResponse {
    answer: string;
    toolUsed: string | null;
    mode: "remote-openai" | "in-process" | "direct";
}

class McpService {
    public ask(question: string): Promise<McpAskResponse> {
        return http.post<McpAskResponse>(appConfig.aiUrls.mcpAsk, { question });
    }
}

export const mcpService = new McpService();
