/*
    User validation.

    Validates and normalises incoming query parameters,
    route parameters and request bodies before they reach
    the controller and service.
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
    Reusable validation rules for user fields.
*/
const userFieldsSchema = z.object({
    userName: z
        .string()
        .trim()
        .min(1, "User name is required")
        .max(100, "User name must not exceed 100 characters"),

    country: z
        .string()
        .trim()
        .min(1, "Country is required")
        .max(100, "Country must not exceed 100 characters"),

    position: z
        .string()
        .trim()
        .min(1, "Position is required")
        .max(100, "Position must not exceed 100 characters"),

    salary: z
        .number()
        .nonnegative("Salary cannot be negative")
        .max(10_000_000, "Salary is too large"),

    department: z
        .string()
        .trim()
        .min(1, "Department is required")
        .max(100, "Department must not exceed 100 characters"),

    yearsOfService: z
        .number()
        .int("Years of service must be a whole number")
        .nonnegative("Years of service cannot be negative")
        .max(80, "Years of service cannot exceed 80"),
});

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

    This schema can be reused for GET, PATCH and DELETE routes.
*/
export const userIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

/*
    Validation schema for POST /users.

    Every user field is required when creating a user.
*/
export const createUserBodySchema = userFieldsSchema.strict();

/*
    Validation schema for PATCH /users/:id.

    Fields are optional, but the request must contain at least
    one recognised field.
*/
export const updateUserBodySchema = userFieldsSchema
    .partial()
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
        message: "At least one field must be provided",
    });
