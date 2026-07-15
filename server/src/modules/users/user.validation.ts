/*
    User validation.

    Validates and normalises incoming query and route parameters
    before they reach the controller and service.
*/

import { z } from "zod";

/*
    Fields clients are allowed to sort by.
*/
const userSortFields = [
    "id",
    "userName",
    "country",
    "position",
    "salary",
    "department",
    "yearsOfService",
] as const;

/*
    Validation schema for GET /users query parameters.
*/
export const listUsersQuerySchema = z
    .object({
        search: z.string().trim().optional(),

        sortBy: z.enum(userSortFields).default("id"),

        order: z.enum(["asc", "desc"]).default("asc"),

        page: z.coerce.number().int().positive().default(1),

        limit: z.coerce.number().int().positive().max(100).default(10),
    })
    .transform((query) => ({
        search: query.search,
        sortBy: query.sortBy,
        sortOrder: query.order,
        page: query.page,
        limit: query.limit,
    }));

/*
    Validation schema for the :id route parameter.
*/
export const userIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});
