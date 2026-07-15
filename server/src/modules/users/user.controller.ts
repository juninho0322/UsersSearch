import type { RequestHandler } from "express";

import { listUsers as listUsersService } from "./user.service.js";
import { listUsersQuerySchema } from "./user.validation.js";

/*
    Handles GET /api/users.
*/
export const listUsers: RequestHandler = (req, res, next) => {
    try {
        const query = listUsersQuerySchema.parse(req.query);

        const result = listUsersService(query);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
