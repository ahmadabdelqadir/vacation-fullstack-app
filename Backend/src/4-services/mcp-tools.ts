import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { mcpHelper } from "../2-utils/mcp-helper";
import { mcpDomainService } from "./mcp-domain-service";

export const MCP_TOOL_NAMES = {
    countActiveVacations: "countActiveVacations",
    getAverageVacationPrice: "getAverageVacationPrice",
    getFutureVacations: "getFutureVacations",
    getFutureEuropeanVacations: "getFutureEuropeanVacations",
    getMostLikedVacations: "getMostLikedVacations",
    getVacationLikesReport: "getVacationLikesReport"
} as const;

export type McpToolName = (typeof MCP_TOOL_NAMES)[keyof typeof MCP_TOOL_NAMES];

class McpTools {

    public countActiveVacations = async (): Promise<CallToolResult> => {
        const data = await mcpDomainService.countActiveVacations();
        return mcpHelper.getToolResult(data);
    };

    public getAverageVacationPrice = async (): Promise<CallToolResult> => {
        const data = await mcpDomainService.getAverageVacationPrice();
        return mcpHelper.getToolResult(data);
    };

    public getFutureVacations = async (): Promise<CallToolResult> => {
        const data = await mcpDomainService.getFutureVacations();
        return mcpHelper.getToolResult(data);
    };

    public getFutureEuropeanVacations = async (): Promise<CallToolResult> => {
        const data = await mcpDomainService.getFutureEuropeanVacations();
        return mcpHelper.getToolResult(data);
    };

    public getMostLikedVacations = async (args: { limit?: number }): Promise<CallToolResult> => {
        const data = await mcpDomainService.getMostLikedVacations(args?.limit ?? 5);
        return mcpHelper.getToolResult(data);
    };

    public getVacationLikesReport = async (): Promise<CallToolResult> => {
        const data = await mcpDomainService.getVacationLikesReport();
        return mcpHelper.getToolResult(data);
    };

    /** Called directly by the in-process fallback in mcp-ask-service. */
    public async callByName(name: McpToolName, args: Record<string, unknown> = {}): Promise<unknown> {
        switch (name) {
            case MCP_TOOL_NAMES.countActiveVacations:
                return mcpDomainService.countActiveVacations();
            case MCP_TOOL_NAMES.getAverageVacationPrice:
                return mcpDomainService.getAverageVacationPrice();
            case MCP_TOOL_NAMES.getFutureVacations:
                return mcpDomainService.getFutureVacations();
            case MCP_TOOL_NAMES.getFutureEuropeanVacations:
                return mcpDomainService.getFutureEuropeanVacations();
            case MCP_TOOL_NAMES.getMostLikedVacations:
                return mcpDomainService.getMostLikedVacations(Number(args?.limit ?? 5));
            case MCP_TOOL_NAMES.getVacationLikesReport:
                return mcpDomainService.getVacationLikesReport();
            default:
                throw new Error(`Unknown MCP tool: ${name}`);
        }
    }
}

export const mcpTools = new McpTools();
