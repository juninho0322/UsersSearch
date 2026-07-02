import type { ErrorRequestHandler } from "express";
import { AppError } from "../shared/errors/AppError.js";
import type { ErrorResponse } from "../shared/types/api-response.js";

/*
    Global error-handling middleware.

    This catches errors passed through Express and converts them into
    consistent API error responses.

    Expected errors use AppError.
    Unexpected errors are hidden behind a safe 500 response.
*/
export const errorMiddleware: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next
) => {
    if (error instanceof AppError) {
        const response: ErrorResponse = {
            error: {
                message: error.message,
                code: error.code,
                details: error.details,
            },
        };

        res.status(error.statusCode).json(response);
        return;
    }

    const response: ErrorResponse = {
        error: {
            message: "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
        },
    };

    res.status(500).json(response);
};