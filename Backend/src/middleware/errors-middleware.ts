import { NextFunction, Request, Response } from "express";
import { appConfig } from "../utils/app-config";
import { RouteNotFoundError } from "../models/client-errors";
import { StatusCode } from "../models/enums";

class ErrorsMiddleware {

    public catchAll(err: any, request: Request, response: Response, _next: NextFunction): void {
        const status: number = err?.status ?? StatusCode.InternalServerError;
        const isServerError = status >= 500 && status <= 599;
        if (isServerError && !appConfig.isTest) {
            console.error(err);
        }
        const message =
            appConfig.isProduction && isServerError
                ? "Some error occurred, please try again later."
                : err?.message ?? "Unknown error.";
        response.status(status).json({ message });
    }

    public routeNotFound(request: Request, _response: Response, next: NextFunction): void {
        next(new RouteNotFoundError(request.originalUrl));
    }

}

export const errorsMiddleware = new ErrorsMiddleware();
