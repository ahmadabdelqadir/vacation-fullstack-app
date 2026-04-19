import { appConfig } from "../Utils/AppConfig";
import { http } from "./HttpService";
import type { LikeResponse, PageResultModel, VacationFilter, VacationModel } from "../Models/VacationModel";

export interface ListParams {
    page: number;
    filter: VacationFilter;
    limit?: number;
}

class VacationService {

    public list(params: ListParams): Promise<PageResultModel<VacationModel>> {
        return http.get<PageResultModel<VacationModel>>(appConfig.vacationsUrls.list, {
            params: {
                page: params.page,
                limit: params.limit ?? appConfig.vacationsPerPage,
                filter: params.filter
            }
        });
    }

    public one(id: string): Promise<VacationModel> {
        return http.get<VacationModel>(appConfig.vacationsUrls.one(id));
    }

    public like(id: string): Promise<LikeResponse> {
        return http.post<LikeResponse>(appConfig.vacationsUrls.like(id));
    }

    public unlike(id: string): Promise<LikeResponse> {
        return http.delete<LikeResponse>(appConfig.vacationsUrls.like(id));
    }
}

export const vacationService = new VacationService();
