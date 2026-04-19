import { csvHelper } from "../utils/csv-helper";
import { mcpDomainService, DestinationLikes } from "./mcp-domain-service";

class ReportService {

    public getLikesByDestination(): Promise<DestinationLikes[]> {
        return mcpDomainService.getVacationLikesReport();
    }

    public async getLikesByDestinationCsv(): Promise<string> {
        const rows = await this.getLikesByDestination();
        const csvRows = rows.map(row => [row.destination, row.likes]);
        return csvHelper.build(["Destination", "Likes"], csvRows);
    }
}

export const reportService = new ReportService();
