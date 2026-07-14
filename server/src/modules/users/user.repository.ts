import { mockUsers } from "./user.mock-data.js";
import type { User } from "./user.model.js";

/*
    User repository.

    This file is responsible for retrieving user data.

    It acts as the boundary between the application's business logic
    and the data source. Today the data comes from mock data, but
    later it can come from a database without affecting the service.
*/

/**
 * Returns all users.
 */
export function getAllUsers(): User[] {
    return mockUsers;
}

/**
 * Returns a user with the matching id.
 * Returns undefined if no user exists.
 */
export function getUserById(id: number): User | undefined {
    return mockUsers.find((user) => user.id === id);
}

/**
 * Returns the total number of users.
 */
export function getUserCount(): number {
    return mockUsers.length;
}