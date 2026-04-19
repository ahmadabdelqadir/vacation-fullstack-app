import { appConfig } from "../Utils/AppConfig";
import { http } from "./HttpService";

export interface DestinationLikes {
    destination: string;
    likes: number;
}

class ReportService {

    public json(): Promise<DestinationLikes[]> {
        return http.get<DestinationLikes[]>(appConfig.adminUrls.reportJson);
    }

    public async downloadCsv(): Promise<void> {
        const response = await http.axios.get<Blob>(appConfig.adminUrls.reportCsv, {
            responseType: "blob"
        });
        const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "vacation-likes-report.csv";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }
}

export const reportService = new ReportService();
