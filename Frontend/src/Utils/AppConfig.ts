class AppConfig {

    public readonly apiBaseUrl: string =
        (import.meta.env.VITE_API_BASE_URL as string) ?? "http://localhost:4000";

    public readonly vacationsPerPage = 9;

    public readonly authUrls = {
        register: "/api/auth/register",
        login: "/api/auth/login",
        me: "/api/auth/me"
    };

    public readonly vacationsUrls = {
        list: "/api/vacations",
        one: (id: string) => `/api/vacations/${id}`,
        like: (id: string) => `/api/vacations/${id}/like`,
        image: (fileName: string) => `/api/vacations/images/${fileName}`
    };

    public readonly adminUrls = {
        create: "/api/admin/vacations",
        update: (id: string) => `/api/admin/vacations/${id}`,
        remove: (id: string) => `/api/admin/vacations/${id}`,
        reportJson: "/api/admin/reports/vacations-likes",
        reportCsv: "/api/admin/reports/vacations-likes/csv"
    };

    public readonly aiUrls = {
        recommendation: "/api/ai/recommendation",
        mcpAsk: "/api/mcp/ask"
    };

    public imageUrl(fileName: string): string {
        if (!fileName) return "";
        // Strip a trailing slash from the base URL to avoid producing "//api/..."
        // which the browser treats as protocol-relative (and tries to resolve
        // "api" as a hostname). Happens when baseUrl is "/" in the Docker build.
        const base = this.apiBaseUrl.replace(/\/+$/, "");
        return base + this.vacationsUrls.image(fileName);
    }
}

export const appConfig = new AppConfig();
