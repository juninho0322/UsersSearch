import { describe, expect, it } from "vitest";
import { listUsers } from "../../src/modules/users/user.service.js";
import type { ListUsersQuery } from "../../src/modules/users/user.model.js";

const defaultQuery: ListUsersQuery = {
    sortBy: "id",
    sortOrder: "asc",
    page: 1,
    limit: 10,
};

describe("listUsers", () => {
    it("returns users", () => {
        const result = listUsers(defaultQuery);

        expect(result.data.length).toBeGreaterThan(0);
    });

    it("searches users by name", () => {
        const result = listUsers({
            ...defaultQuery,
            search: "Luis",
        });

        expect(result.data.length).toBeGreaterThan(0);
        expect(
            result.data.every((user) =>
                user.userName.toLowerCase().includes("luis")
            )
        ).toBe(true);
    });

    it("searches users by country", () => {
        const result = listUsers({
            ...defaultQuery,
            search: "Brazil",
        });

        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data.some((user) => user.country === "Brazil")).toBe(
            true
        );
    });

    it("sorts users by salary ascending", () => {
        const result = listUsers({
            ...defaultQuery,
            sortBy: "salary",
            sortOrder: "asc",
        });

        for (let index = 1; index < result.data.length; index++) {
            expect(result.data[index - 1].salary).toBeLessThanOrEqual(
                result.data[index].salary
            );
        }
    });

    it("sorts users by salary descending", () => {
        const result = listUsers({
            ...defaultQuery,
            sortBy: "salary",
            sortOrder: "desc",
        });

        for (let index = 1; index < result.data.length; index++) {
            expect(result.data[index - 1].salary).toBeGreaterThanOrEqual(
                result.data[index].salary
            );
        }
    });

    it("sorts users by userName ascending", () => {
        const result = listUsers({
            ...defaultQuery,
            sortBy: "userName",
            sortOrder: "asc",
        });

        for (let index = 1; index < result.data.length; index++) {
            const previousName = result.data[index - 1].userName;
            const currentName = result.data[index].userName;

            expect(previousName.localeCompare(currentName)).toBeLessThanOrEqual(
                0
            );
        }
    });

    it("returns the correct pagination slice", () => {
        const firstPage = listUsers({
            ...defaultQuery,
            page: 1,
            limit: 2,
        });

        const secondPage = listUsers({
            ...defaultQuery,
            page: 2,
            limit: 2,
        });

        expect(firstPage.data).toHaveLength(2);
        expect(secondPage.data).toHaveLength(2);

        expect(firstPage.data[0].id).not.toBe(secondPage.data[0].id);
    });

    it("returns correct pagination metadata", () => {
        const result = listUsers({
            ...defaultQuery,
            page: 1,
            limit: 2,
        });

        expect(result.meta).toBeDefined();
        expect(result.meta?.page).toBe(1);
        expect(result.meta?.limit).toBe(2);
        expect(result.meta?.total).toBeGreaterThan(0);
        expect(result.meta?.totalPages).toBe(Math.ceil(result.meta!.total / 2));
    });

    it("returns an empty array when no users match the search", () => {
        const result = listUsers({
            ...defaultQuery,
            search: "user-that-does-not-exist-12345",
        });

        expect(result.data).toEqual([]);
        expect(result.meta?.total).toBe(0);
    });
});
