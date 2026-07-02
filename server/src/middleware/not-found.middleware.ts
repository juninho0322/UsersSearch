import type { RequestHandler } from "express";
import type { ErrorResponse } from "../shared/types/api-response.js";

/*
    Not-found middleware.

    This handles requests that reach the end of the middleware chain
    without matching any route.
*/
export const notFoundMiddleware: RequestHandler = (req, res) => {
    const response: ErrorResponse = {
        error: {
            message: `Route ${req.method} ${req.originalUrl} not found`,
            code: "ROUTE_NOT_FOUND",
        },
    };

    res.status(404).json(response);
};