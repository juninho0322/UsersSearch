/*
    Shared API response types.

    These types define the standard shape of responses sent by the backend.
    They help keep successful responses, error responses, and paginated
    responses predictable across the whole API.
*/

export type PaginationMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type SuccessResponse<T> = {
    data: T;
    meta?: PaginationMeta;
};

export type ErrorResponse = {
    error: {
        message: string;
        code: string;
        details?: unknown;
    };
};