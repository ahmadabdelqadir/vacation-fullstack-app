import dotenv from "dotenv";

dotenv.config({ quiet: true });

class AppConfig {

    public readonly environment = process.env.ENVIRONMENT ?? "development";
    public readonly isDevelopment = this.environment === "development";
    public readonly isProduction = this.environment === "production";
    public readonly isTest = this.environment === "test";

    public readonly port = Number(process.env.PORT ?? 4000);
    public readonly mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING ?? "mongodb://127.0.0.1:27017/vacations";

    public readonly jwtSecret = process.env.JWT_SECRET ?? "";
    public readonly bcryptRounds = this.parseBcryptRounds(process.env.BCRYPT_ROUNDS);
    public readonly hashSalt = process.env.HASH_SALT ?? "";

    public readonly aiApiKey = process.env.AI_API_KEY ?? "";
    public readonly aiModel = process.env.AI_MODEL ?? "gpt-4o-mini";
    public readonly mcpPublicUrl = process.env.MCP_PUBLIC_URL ?? "";

    public readonly runSeed = (process.env.RUN_SEED ?? "true").toLowerCase() === "true";

    public readonly vacationsPerPage = 9;

    private parseBcryptRounds(rawValue: string | undefined): number {
        const parsed = Number(rawValue ?? 10);
        if (!Number.isInteger(parsed) || parsed < 8 || parsed > 15) {
            return 10;
        }

        return parsed;
    }
}

export const appConfig = new AppConfig();
