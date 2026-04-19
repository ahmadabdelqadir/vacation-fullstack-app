export type VacationFilter = "all" | "liked" | "active" | "upcoming";

export type Continent =
    | "Africa"
    | "Asia"
    | "Europe"
    | "NorthAmerica"
    | "SouthAmerica"
    | "Oceania"
    | "Antarctica";

export interface VacationModel {
    _id: string;
    vacationCode: string;
    destination: string;
    description: string;
    startDate: string;
    endDate: string;
    price: number;
    imageFileName: string;
    continent: Continent;
    totalLikes: number;
    isLikedByCurrentUser: boolean;
}

export interface PageResultModel<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface LikeResponse {
    liked: boolean;
    totalLikes: number;
}
