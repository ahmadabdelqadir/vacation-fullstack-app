import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { mcpTools } from "./mcp-tools";

class McpRegister {

    public registerCountActiveVacationsTool(mcpServer: McpServer): void {
        mcpServer.registerTool(
            "countActiveVacations",
            { description: "Count the vacations that are currently active (startDate <= today <= endDate)." },
            mcpTools.countActiveVacations
        );
    }

    public registerGetAverageVacationPriceTool(mcpServer: McpServer): void {
        mcpServer.registerTool(
            "getAverageVacationPrice",
            { description: "Return the average price across all vacations and the total count." },
            mcpTools.getAverageVacationPrice
        );
    }

    public registerGetFutureVacationsTool(mcpServer: McpServer): void {
        mcpServer.registerTool(
            "getFutureVacations",
            { description: "List every upcoming vacation (startDate > today), sorted ascending." },
            mcpTools.getFutureVacations
        );
    }

    public registerGetFutureEuropeanVacationsTool(mcpServer: McpServer): void {
        mcpServer.registerTool(
            "getFutureEuropeanVacations",
            { description: "List upcoming vacations where continent = 'Europe'." },
            mcpTools.getFutureEuropeanVacations
        );
    }

    public registerGetMostLikedVacationsTool(mcpServer: McpServer): void {
        mcpServer.registerTool(
            "getMostLikedVacations",
            {
                description: "Return the most liked vacations. Optional limit (default 5, max 50).",
                inputSchema: z.object({ limit: z.number().int().min(1).max(50).optional() })
            },
            mcpTools.getMostLikedVacations
        );
    }

    public registerGetVacationLikesReportTool(mcpServer: McpServer): void {
        mcpServer.registerTool(
            "getVacationLikesReport",
            { description: "Return [{ destination, likes }] for every vacation - the admin chart data." },
            mcpTools.getVacationLikesReport
        );
    }
}

export const mcpRegister = new McpRegister();
