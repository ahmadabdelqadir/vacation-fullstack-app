import { appConfig } from "../Utils/AppConfig";
import { http } from "./HttpService";

class AiService {
    public recommend(destination: string): Promise<{ text: string }> {
        return http.post(appConfig.aiUrls.recommendation, { destination });
    }
}

export const aiService = new AiService();
