import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
    CreateUserInput,
    ListUsersQuery,
    UpdateUserInput,
    User,
} from "../../src/modules/users/user.model.js";

const users: User[] = [
    {
        id: 1,
        userName: "Luis",
        country: "Brazil",
        position: "Frontend Developer",
        salary: 70000,
        department: "Engineering",
        yearsOfService: 3,
    },
    {
        id: 2,
        userName: "Maya",
        country: "United Kingdom",
        position: "Product Manager",
        salary: 82000,
        department: "Product",
        yearsOfService: 5,
    },
];

const mockListUsersRepository = vi.fn(async (query: ListUsersQuery) => {
    const search = query.search?.toLowerCase();
    const filteredUsers = search
        ? users.filter((user) =>
              [
                  user.userName,
                  user.country,
                  user.position,
                  user.department,
              ].some((value) => value.toLowerCase().includes(search))
          )
        : users;

    return {
        users: filteredUsers,
        total: filteredUsers.length,
    };
});

const mockGetUserById = vi.fn(async (id: number) =>
    users.find((user) => user.id === id)
);

const mockCreateUserRepository = vi.fn(async (input: CreateUserInput) => ({
    id: 3,
    ...input,
}));

const mockUpdateUserRepository = vi.fn(
    async (id: number, input: UpdateUserInput) => {
        const user = users.find((candidate) => candidate.id === id);

        return user ? { ...user, ...input } : undefined;
    }
);

const mockDeleteUserRepository = vi.fn(async (id: number) =>
    users.find((user) => user.id === id)
);

vi.mock("../../src/modules/users/user.repository.js", () => ({
    listUsers: mockListUsersRepository,
    getUserById: mockGetUserById,
    createUser: mockCreateUserRepository,
    updateUser: mockUpdateUserRepository,
    deleteUser: mockDeleteUserRepository,
}));

const { app } = await import("../../src/app.js");

describe("User routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("GET /health returns success", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("OK");
    });

    it("GET /api/users returns data and meta", async () => {
        const response = await request(app).get("/api/users");

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.meta).toEqual({
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
        });
    });

    it("searches users through the HTTP query", async () => {
        const response = await request(app)
            .get("/api/users")
            .query({ search: "Luis" });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].userName).toBe("Luis");
    });

    it("GET /api/users/:id returns one user", async () => {
        const response = await request(app).get("/api/users/1");

        expect(response.status).toBe(200);
        expect(response.body.data.userName).toBe("Luis");
    });

    it("POST /api/users creates a user", async () => {
        const response = await request(app)
            .post("/api/users")
            .send({
                userName: "Noah",
                country: "Canada",
                position: "Designer",
                salary: 64000,
                department: "Design",
                yearsOfService: 2,
            });

        expect(response.status).toBe(201);
        expect(response.body.data.id).toBe(3);
        expect(response.body.data.userName).toBe("Noah");
    });

    it("PATCH /api/users/:id updates a user", async () => {
        const response = await request(app)
            .patch("/api/users/1")
            .send({ position: "Senior Frontend Developer" });

        expect(response.status).toBe(200);
        expect(response.body.data.position).toBe("Senior Frontend Developer");
    });

    it("DELETE /api/users/:id deletes a user", async () => {
        const response = await request(app).delete("/api/users/1");

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
    });

    it("returns a validation error for an invalid page", async () => {
        const response = await request(app)
            .get("/api/users")
            .query({ page: 0 });

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns a validation error for invalid create data", async () => {
        const response = await request(app)
            .post("/api/users")
            .send({ userName: "" });

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 for a missing user", async () => {
        const response = await request(app).get("/api/users/999");

        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe("USER_NOT_FOUND");
    });

    it("returns 404 for an unknown route", async () => {
        const response = await request(app).get("/api/unknown");

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error");
    });
});
