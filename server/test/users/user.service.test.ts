import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreateUserInput, ListUsersQuery, User } from "../../src/modules/users/user.model.js";

const mockListUsersRepository = vi.fn();
const mockGetUserById = vi.fn();
const mockCreateUserRepository = vi.fn();
const mockUpdateUserRepository = vi.fn();
const mockDeleteUserRepository = vi.fn();

vi.mock("../../src/modules/users/user.repository.js", () => ({
    listUsers: mockListUsersRepository,
    getUserById: mockGetUserById,
    createUser: mockCreateUserRepository,
    updateUser: mockUpdateUserRepository,
    deleteUser: mockDeleteUserRepository,
}));

const {
    createUser,
    deleteUser,
    findUserById,
    listUsers,
    updateUser,
} = await import("../../src/modules/users/user.service.js");

const defaultQuery: ListUsersQuery = {
    sortBy: "id",
    sortOrder: "asc",
    page: 1,
    limit: 10,
};

const user: User = {
    id: 1,
    userName: "Luis",
    country: "Brazil",
    position: "Frontend Developer",
    salary: 70000,
    department: "Engineering",
    yearsOfService: 3,
};

const createInput: CreateUserInput = {
    userName: "Maya",
    country: "United Kingdom",
    position: "Product Manager",
    salary: 82000,
    department: "Product",
    yearsOfService: 5,
};

describe("user service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns users with pagination metadata", async () => {
        mockListUsersRepository.mockResolvedValue({
            users: [user],
            total: 23,
        });

        const result = await listUsers(defaultQuery);

        expect(mockListUsersRepository).toHaveBeenCalledWith(defaultQuery);
        expect(result.data).toEqual([user]);
        expect(result.meta).toEqual({
            page: 1,
            limit: 10,
            total: 23,
            totalPages: 3,
        });
    });

    it("returns one user by id", async () => {
        mockGetUserById.mockResolvedValue(user);

        await expect(findUserById(1)).resolves.toEqual(user);
    });

    it("throws a 404 when a user does not exist", async () => {
        mockGetUserById.mockResolvedValue(undefined);

        await expect(findUserById(999)).rejects.toMatchObject({
            statusCode: 404,
            code: "USER_NOT_FOUND",
        });
    });

    it("creates a user", async () => {
        const createdUser = {
            id: 2,
            ...createInput,
        };

        mockCreateUserRepository.mockResolvedValue(createdUser);

        await expect(createUser(createInput)).resolves.toEqual(createdUser);
        expect(mockCreateUserRepository).toHaveBeenCalledWith(createInput);
    });

    it("updates a user", async () => {
        const updatedUser = {
            ...user,
            position: "Senior Frontend Developer",
        };

        mockUpdateUserRepository.mockResolvedValue(updatedUser);

        await expect(
            updateUser(1, { position: "Senior Frontend Developer" })
        ).resolves.toEqual(updatedUser);
    });

    it("throws a 404 when updating a missing user", async () => {
        mockUpdateUserRepository.mockResolvedValue(undefined);

        await expect(updateUser(999, { country: "Portugal" })).rejects.toMatchObject({
            statusCode: 404,
            code: "USER_NOT_FOUND",
        });
    });

    it("deletes a user", async () => {
        mockDeleteUserRepository.mockResolvedValue(user);

        await expect(deleteUser(1)).resolves.toBeUndefined();
        expect(mockDeleteUserRepository).toHaveBeenCalledWith(1);
    });

    it("throws a 404 when deleting a missing user", async () => {
        mockDeleteUserRepository.mockResolvedValue(undefined);

        await expect(deleteUser(999)).rejects.toMatchObject({
            statusCode: 404,
            code: "USER_NOT_FOUND",
        });
    });
});
