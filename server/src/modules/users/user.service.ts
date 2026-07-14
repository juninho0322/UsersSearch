/*
    User service.

    This file contains the business logic for the users module.

    It gets user data through the repository, then applies searching,
    sorting and pagination.

    It does not contain Express code, raw query-string validation,
    or direct access to the mock data/database.
*/

import { getAllUsers, getUserById } from "./user.repository.js";

import type { ListUsersQuery, User } from "./user.model.js";

import type {
    PaginationMeta,
    SuccessResponse,
} from "../../shared/types/api-response.js";

type ListUsersResult = SuccessResponse<User[]>;

/**
 * Returns a filtered, sorted and paginated list of users.
 */
export function listUsers(query: ListUsersQuery): ListUsersResult {
    const allUsers = getAllUsers();

    // Create a copy so the original mock-data array is not changed.
    let processedUsers = [...allUsers];

    // Apply search.
    if (query.search) {
        const searchText = query.search.trim().toLowerCase();

        processedUsers = processedUsers.filter((user) => {
            const searchableValues = [
                user.userName,
                user.country,
                user.position,
                user.department,
                String(user.salary),
                String(user.yearsOfService),
            ];

            return searchableValues.some((value) =>
                value.toLowerCase().includes(searchText)
            );
        });
    }

    // Apply sorting.
    processedUsers.sort((firstUser, secondUser) => {
        const firstValue = firstUser[query.sortBy];
        const secondValue = secondUser[query.sortBy];

        let comparison = 0;

        if (typeof firstValue === "string" && typeof secondValue === "string") {
            comparison = firstValue.localeCompare(secondValue);
        } else if (
            typeof firstValue === "number" &&
            typeof secondValue === "number"
        ) {
            comparison = firstValue - secondValue;
        }

        return query.sortOrder === "asc" ? comparison : -comparison;
    });

    // Metadata must be calculated after filtering,
    // but before pagination.
    const total = processedUsers.length;
    const totalPages = Math.ceil(total / query.limit);

    // Calculate which section of the array belongs to the requested page.
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;

    const paginatedUsers = processedUsers.slice(startIndex, endIndex);

    const meta: PaginationMeta = {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
    };

    return {
        data: paginatedUsers,
        meta,
    };
}

/**
 * Returns one user by id.
 *
 * The service currently returns undefined when the user does not exist.
 * Later, this can throw an AppError with a 404 status.
 */
export function findUserById(id: number): User | undefined {
    return getUserById(id);
}
