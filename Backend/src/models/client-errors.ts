import { StatusCode } from "./enums";

abstract class BaseClientError extends Error {
    public status: StatusCode;
    public constructor(status: StatusCode, message: string) {
        super(message);
        this.status = status;
    }
}

export class RouteNotFoundError extends BaseClientError {
    public constructor(route: string) {
        super(StatusCode.NotFound, `Route ${route} not found.`);
    }
}

export class ResourceNotFoundError extends BaseClientError {
    public constructor(id: string | number) {
        super(StatusCode.NotFound, `Resource with id ${id} was not found.`);
    }
}

export class ValidationError extends BaseClientError {
    public constructor(message: string) {
        super(StatusCode.BadRequest, message);
    }
}

export class UnauthorizedError extends BaseClientError {
    public constructor(message: string) {
        super(StatusCode.Unauthorized, message);
    }
}

export class ForbiddenError extends BaseClientError {
    public constructor(message: string) {
        super(StatusCode.Forbidden, message);
    }
}

export class ConflictError extends BaseClientError {
    public constructor(message: string) {
        super(StatusCode.Conflict, message);
    }
}

export class UnsupportedMediaError extends BaseClientError {
    public constructor(message: string) {
        super(StatusCode.UnsupportedMediaType, message);
    }
}
