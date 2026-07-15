import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../shared/errors/AppError.js";
import type { ErrorResponse } from "../shared/types/api-response.js";

/*
    Converts application and validation errors into API responses.
*/
export const errorMiddleware: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next
) => {
    if (error instanceof ZodError) {
        const response: ErrorResponse = {
            error: {
                message: "Invalid request data",
                code: "VALIDATION_ERROR",
                details: error.flatten(),
            },
        };

        res.status(400).json(response);
        return;
    }

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
