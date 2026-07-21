import {
    createUser as createUserRepository,
    deleteUser as deleteUserRepository,
    getUserById,
    listUsers as listUsersRepository,
    updateUser as updateUserRepository,
} from "./user.repository.js";

import { AppError } from "../../shared/errors/AppError.js";

import type {
    CreateUserInput,
    ListUsersQuery,
    UpdateUserInput,
    User,
} from "./user.model.js";

import type {
    PaginationMeta,
    SuccessResponse,
} from "../../shared/types/api-response.js";

type ListUsersResult = SuccessResponse<User[]>;

export async function listUsers(
    query: ListUsersQuery
): Promise<ListUsersResult> {
    const { users, total } = await listUsersRepository(query);
    const totalPages = Math.ceil(total / query.limit);

    const meta: PaginationMeta = {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
    };

    return {
        data: users,
        meta,
    };
}

export async function findUserById(id: number): Promise<User> {
    const user = await getUserById(id);

    if (!user) {
        throw new AppError(404, "USER_NOT_FOUND", undefined, "User not found");
    }

    return user;
}

export async function createUser(input: CreateUserInput): Promise<User> {
    return await createUserRepository(input);
}

export async function updateUser(
    id: number,
    input: UpdateUserInput
): Promise<User> {
    const user = await updateUserRepository(id, input);

    if (!user) {
        throw new AppError(404, "USER_NOT_FOUND", undefined, "User not found");
    }

    return user;
}

export async function deleteUser(id: number): Promise<void> {
    const user = await deleteUserRepository(id);

    if (!user) {
        throw new AppError(404, "USER_NOT_FOUND", undefined, "User not found");
    }
}
