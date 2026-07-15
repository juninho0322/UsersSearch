/*
    User model.

    This file defines the data shapes used by the users module.

    It describes what a user looks like, which fields can be used
    for sorting, and the shape of a validated list-users query.

    It does not contain business logic, database logic, or Express code.
*/

export type User = {
    id: number;
    userName: string;
    country: string;
    position: string;
    salary: number;
    department: string;
    yearsOfService: number;
};

export type UserSortField =
    | "id"
    | "userName"
    | "country"
    | "position"
    | "salary"
    | "department"
    | "yearsOfService";

export type UserSortOrder = "asc" | "desc";

export type ListUsersQuery = {
    search?: string;
    sortBy: UserSortField;
    sortOrder: UserSortOrder;
    page: number;
    limit: number;
};
