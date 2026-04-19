import { appConfig } from "../utils/app-config";
import { aiService } from "./ai-service";
import { McpToolName, MCP_TOOL_NAMES, mcpTools } from "./mcp-tools";

export interface McpAskResponse {
    answer: string;
    toolUsed: McpToolName | null;
    mode: "remote-openai" | "in-process" | "direct";
}

// Takes a natural-language question and routes it to one of our MCP tools.
// If AI_API_KEY and MCP_PUBLIC_URL are both set, OpenAI handles the routing.
// Otherwise we match a few keywords ourselves and call the tool directly.
class McpAskService {

    public async ask(question: string): Promise<McpAskResponse> {
        const useRemote = aiService.isConfigured && !!appConfig.mcpPublicUrl;
        if (useRemote) {
            const answer = await aiService.answerViaRemoteMcp(question, appConfig.mcpPublicUrl);
            return { answer, toolUsed: null, mode: "remote-openai" };
        }

        const toolName = this.routeQuestion(question);
        const args = this.buildArgs(question, toolName);
        const data = await mcpTools.callByName(toolName, args);

        if (aiService.isConfigured) {
            const summary = await aiService.summarize(question, toolName, data);
            return { answer: summary, toolUsed: toolName, mode: "in-process" };
        }

        return {
            answer: this.describeDirect(toolName, data),
            toolUsed: toolName,
            mode: "direct"
        };
    }

    private routeQuestion(rawQuestion: string): McpToolName {
        const q = rawQuestion.toLowerCase();

        if (/(european|europe)/.test(q) && /(future|upcoming|next|coming|planned)/.test(q)) {
            return MCP_TOOL_NAMES.getFutureEuropeanVacations;
        }
        if (/(average|mean|avg).*(price|cost)/.test(q) || /price.*(average|mean|avg)/.test(q)) {
            return MCP_TOOL_NAMES.getAverageVacationPrice;
        }
        if (/(active|currently|right now|ongoing|happening now)/.test(q) && /(vacation|holiday|trip)/.test(q)) {
            return MCP_TOOL_NAMES.countActiveVacations;
        }
        if (/(how many|count).*(active|currently|right now|ongoing)/.test(q)) {
            return MCP_TOOL_NAMES.countActiveVacations;
        }
        if (/(most liked|top liked|popular|best liked)/.test(q)) {
            return MCP_TOOL_NAMES.getMostLikedVacations;
        }
        if (/(report|likes report|likes by|destination vs likes)/.test(q)) {
            return MCP_TOOL_NAMES.getVacationLikesReport;
        }
        if (/(future|upcoming|next|coming|planned)/.test(q)) {
            return MCP_TOOL_NAMES.getFutureVacations;
        }
        // Nothing matched - just return the upcoming list as a reasonable default.
        return MCP_TOOL_NAMES.getFutureVacations;
    }

    private buildArgs(question: string, toolName: McpToolName): Record<string, unknown> {
        if (toolName !== MCP_TOOL_NAMES.getMostLikedVacations) return {};
        const match = question.match(/top\s+(\d+)|(\d+)\s+most/i);
        const raw = match?.[1] ?? match?.[2];
        const limit = raw ? Math.max(1, Math.min(50, parseInt(raw, 10))) : 5;
        return { limit };
    }

    private describeDirect(toolName: McpToolName, data: unknown): string {
        switch (toolName) {
            case MCP_TOOL_NAMES.countActiveVacations: {
                const { count } = data as { count: number };
                return `There are currently ${count} active vacation${count === 1 ? "" : "s"}.`;
            }
            case MCP_TOOL_NAMES.getAverageVacationPrice: {
                const { averagePrice, totalVacations } = data as { averagePrice: number; totalVacations: number };
                return `The average vacation price is $${averagePrice.toLocaleString()} across ${totalVacations} vacations.`;
            }
            case MCP_TOOL_NAMES.getFutureEuropeanVacations: {
                const vacations = data as Array<{ destination: string; startDate: string }>;
                if (vacations.length === 0) return "There are no upcoming European vacations right now.";
                const names = vacations.map(vacation => vacation.destination).join(", ");
                return `Upcoming European vacations: ${names}.`;
            }
            case MCP_TOOL_NAMES.getFutureVacations: {
                const vacations = data as Array<{ destination: string }>;
                if (vacations.length === 0) return "There are no upcoming vacations right now.";
                return `Upcoming vacations: ${vacations.map(vacation => vacation.destination).join(", ")}.`;
            }
            case MCP_TOOL_NAMES.getMostLikedVacations: {
                const ranked = data as Array<{ destination: string; likes: number }>;
                if (ranked.length === 0) return "No likes have been recorded yet.";
                return (
                    "Most liked: " +
                    ranked.map(entry => `${entry.destination} (${entry.likes})`).join(", ") +
                    "."
                );
            }
            case MCP_TOOL_NAMES.getVacationLikesReport: {
                const report = data as Array<{ destination: string; likes: number }>;
                return `Likes report ready for ${report.length} destinations.`;
            }
            default:
                return JSON.stringify(data);
        }
    }
}

export const mcpAskService = new McpAskService();
