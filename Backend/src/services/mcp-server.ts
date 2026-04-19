import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpRegister } from "./mcp-register";

class VacationsMcpServer {

    public createMcpServer(): McpServer {
        const mcpServer = new McpServer({
            name: "vacations-mcp",
            version: "1.0.0"
        });

        mcpRegister.registerCountActiveVacationsTool(mcpServer);
        mcpRegister.registerGetAverageVacationPriceTool(mcpServer);
        mcpRegister.registerGetFutureVacationsTool(mcpServer);
        mcpRegister.registerGetFutureEuropeanVacationsTool(mcpServer);
        mcpRegister.registerGetMostLikedVacationsTool(mcpServer);
        mcpRegister.registerGetVacationLikesReportTool(mcpServer);

        return mcpServer;
    }
}

export const vacationsMcpServer = new VacationsMcpServer();
