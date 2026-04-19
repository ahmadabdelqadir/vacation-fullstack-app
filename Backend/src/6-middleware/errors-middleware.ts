import { NextFunction, Request, Response } from "express";
import { appConfig } from "../2-utils/app-config";
import { RouteNotFoundError } from "../3-models/client-errors";
import { StatusCode } from "../3-models/enums";

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
