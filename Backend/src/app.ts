import cors from "cors";
import express, { Express, Request } from "express";
import expressFileUpload from "express-fileupload";
import { sseHandlers } from "express-mcp-handler";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import path from "path";
import { fileSaver } from "uploaded-file-saver";
import { appConfig } from "./2-utils/app-config";
import { seeder } from "./2-utils/seeder";
import { vacationsMcpServer } from "./4-services/mcp-server";
import { adminVacationsController } from "./5-controllers/admin-vacations-controller";
import { aiController } from "./5-controllers/ai-controller";
import { authController } from "./5-controllers/auth-controller";
import { mcpAskController } from "./5-controllers/mcp-ask-controller";
import { reportsController } from "./5-controllers/reports-controller";
import { vacationsController } from "./5-controllers/vacations-controller";
import { errorsMiddleware } from "./6-middleware/errors-middleware";
import { securityMiddleware } from "./6-middleware/security-middleware";

class App {

    public server!: Express;

    public async start(): Promise<void> {
        try {
            await mongoose.connect(appConfig.mongodbConnectionString);
            console.log("MongoDB connected.");

            if (appConfig.runSeed) {
                await seeder.run();
            }

            this.server = express();

            // Trust the first proxy hop (nginx in the Docker stack). This makes
            // req.ip reflect the real client IP and lets express-rate-limit key
            // its bucket by client rather than by the proxy address.
            this.server.set("trust proxy", 1);

            this.server.use(expressRateLimit({
                windowMs: 1000,
                limit: 40,
                skip: (request: Request) =>
                    request.path.startsWith("/api/vacations/images/") ||
                    request.path === "/sse" ||
                    request.path === "/messages"
            }));

            this.server.use(express.json({ limit: "2mb" }));
            this.server.use(cors());
            this.server.use(helmet({
                crossOriginResourcePolicy: { policy: "same-site" }
            }));
            this.server.use(expressFileUpload());

            const imageLocation = path.join(__dirname, "1-assets", "images");
            fileSaver.config(imageLocation);

            this.server.use(securityMiddleware.preventXss);

            // MCP server: /sse for tool discovery, /messages for tool calls.
            // `express-mcp-handler` expects the low-level `Server` type from an older
            // SDK version. Our `McpServer` is API-compatible at runtime, so we cast
            // at the factory boundary only.
            const mcpServer = vacationsMcpServer.createMcpServer();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mcpServerFactory = () => mcpServer as any;
            const { getHandler, postHandler } = sseHandlers(mcpServerFactory, {});
            this.server.get("/sse", getHandler);
            this.server.post("/messages", postHandler);

            this.server.use(authController.router);
            this.server.use(vacationsController.router);
            this.server.use(adminVacationsController.router);
            this.server.use(reportsController.router);
            this.server.use(aiController.router);
            this.server.use(mcpAskController.router);

            this.server.use(errorsMiddleware.routeNotFound);
            this.server.use(errorsMiddleware.catchAll);

            this.server.listen(appConfig.port, () => {
                console.log("Listening on http://localhost:" + appConfig.port);
                if (appConfig.aiApiKey) {
                    console.log("AI provider: configured (" + appConfig.aiModel + ")");
                } else {
                    console.log("AI provider: disabled (AI_API_KEY is empty).");
                }
                if (appConfig.mcpPublicUrl) {
                    console.log("MCP public URL: " + appConfig.mcpPublicUrl + " (remote-openai mode)");
                } else {
                    console.log("MCP public URL: not set - /api/mcp/ask uses in-process fallback.");
                }
            });
        } catch (err) {
            console.error("Failed to start the backend:", err);
            process.exit(1);
        }
    }
}

const app = new App();
app.start();
