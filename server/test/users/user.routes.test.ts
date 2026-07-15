import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("User routes", () => {
    it("GET /health returns success", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("OK");
    });

    it("GET /api/users returns 200", async () => {
        const response = await request(app).get("/api/users");

        expect(response.status).toBe(200);
    });

    it("GET /api/users returns data and meta", async () => {
        const response = await request(app).get("/api/users");

        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("meta");
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("searches users through the HTTP query", async () => {
        const response = await request(app)
            .get("/api/users")
            .query({ search: "Luis" });

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThan(0);

        expect(
            response.body.data.every((user: { userName: string }) =>
                user.userName.toLowerCase().includes("luis")
            )
        ).toBe(true);
    });

    it("returns a validation error for an invalid page", async () => {
        const response = await request(app)
            .get("/api/users")
            .query({ page: 0 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("returns a validation error for an invalid sort field", async () => {
        const response = await request(app)
            .get("/api/users")
            .query({ sortBy: "invalidField" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("returns 404 for an unknown route", async () => {
        const response = await request(app).get("/api/unknown");

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error");
    });
});
