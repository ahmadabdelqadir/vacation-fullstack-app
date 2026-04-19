export enum StatusCode {
    OK = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    UnsupportedMediaType = 415,
    InternalServerError = 500
}

export enum Role {
    User = "User",
    Admin = "Admin"
}

export enum VacationFilter {
    All = "all",
    Liked = "liked",
    Active = "active",
    Upcoming = "upcoming"
}

export enum Continent {
    Africa = "Africa",
    Asia = "Asia",
    Europe = "Europe",
    NorthAmerica = "NorthAmerica",
    SouthAmerica = "SouthAmerica",
    Oceania = "Oceania",
    Antarctica = "Antarctica"
}
