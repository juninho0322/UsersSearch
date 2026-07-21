import { supabase } from "../../config/supabase.js";
import { AppError } from "../../shared/errors/AppError.js";

import type {
    CreateUserInput,
    ListUsersQuery,
    UpdateUserInput,
    User,
    UserSortField,
} from "./user.model.js";

type UserRow = {
    id: number;
    user_name: string;
    country: string;
    position: string;
    salary: number;
    department: string;
    years_of_service: number;
};

type ListUsersRepositoryResult = {
    users: User[];
    total: number;
};

const USERS_TABLE = "users";

const sortColumnByField: Record<UserSortField, keyof UserRow> = {
    id: "id",
    userName: "user_name",
    country: "country",
    position: "position",
    salary: "salary",
    department: "department",
    yearsOfService: "years_of_service",
};

function mapRowToUser(row: UserRow): User {
    return {
        id: row.id,
        userName: row.user_name,
        country: row.country,
        position: row.position,
        salary: row.salary,
        department: row.department,
        yearsOfService: row.years_of_service,
    };
}

function mapUserToRow(input: CreateUserInput | UpdateUserInput) {
    return {
        ...(input.userName !== undefined && {
            user_name: input.userName,
        }),

        ...(input.country !== undefined && {
            country: input.country,
        }),

        ...(input.position !== undefined && {
            position: input.position,
        }),

        ...(input.salary !== undefined && {
            salary: input.salary,
        }),

        ...(input.department !== undefined && {
            department: input.department,
        }),

        ...(input.yearsOfService !== undefined && {
            years_of_service: input.yearsOfService,
        }),
    };
}

function toDatabaseError(operation: string, details?: unknown): AppError {
    return new AppError(
        500,
        "DATABASE_ERROR",
        details,
        `Could not ${operation}.`
    );
}

function normaliseSearch(search: string): string {
    return search.trim().replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export async function listUsers(
    query: ListUsersQuery
): Promise<ListUsersRepositoryResult> {
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit - 1;

    let request = supabase
        .from(USERS_TABLE)
        .select("*", { count: "exact" })
        .order(sortColumnByField[query.sortBy], {
            ascending: query.sortOrder === "asc",
        })
        .range(startIndex, endIndex);

    if (query.search) {
        const search = normaliseSearch(query.search);

        if (search) {
            request = request.or(
                [
                    `user_name.ilike.%${search}%`,
                    `country.ilike.%${search}%`,
                    `position.ilike.%${search}%`,
                    `department.ilike.%${search}%`,
                ].join(",")
            );
        }
    }

    const { data, error, count } = await request;

    if (error) {
        throw toDatabaseError("retrieve users", error.message);
    }

    const users = ((data ?? []) as UserRow[]).map(mapRowToUser);

    return {
        users,
        total: count ?? users.length,
    };
}

export async function getUserById(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
        .from(USERS_TABLE)
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw toDatabaseError("retrieve user", error.message);
    }

    if (!data) {
        return undefined;
    }

    return mapRowToUser(data as UserRow);
}

export async function createUser(input: CreateUserInput): Promise<User> {
    const { data, error } = await supabase
        .from(USERS_TABLE)
        .insert(mapUserToRow(input))
        .select("*")
        .single();

    if (error) {
        throw toDatabaseError("create user", error.message);
    }

    if (!data) {
        throw toDatabaseError("create user");
    }

    return mapRowToUser(data as UserRow);
}

export async function updateUser(
    id: number,
    input: UpdateUserInput
): Promise<User | undefined> {
    const { data, error } = await supabase
        .from(USERS_TABLE)
        .update(mapUserToRow(input))
        .eq("id", id)
        .select("*")
        .maybeSingle();

    if (error) {
        throw toDatabaseError("update user", error.message);
    }

    if (!data) {
        return undefined;
    }

    return mapRowToUser(data as UserRow);
}

export async function deleteUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
        .from(USERS_TABLE)
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();

    if (error) {
        throw toDatabaseError("delete user", error.message);
    }

    if (!data) {
        return undefined;
    }

    return mapRowToUser(data as UserRow);
}
