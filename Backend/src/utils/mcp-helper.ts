import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

class McpHelper {
    public getToolResult<T>(data: T): CallToolResult {
        const result: CallToolResult = {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data)
                }
            ]
        };
        return result;
    }
}

export const mcpHelper = new McpHelper();
