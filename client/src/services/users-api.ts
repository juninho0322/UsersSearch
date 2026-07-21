import type { PaginationMeta, User, UserInput } from "../types/user";

type ApiErrorResponse = {
  error?: {
    message?: string;
    details?: string | {
      fieldErrors?: Record<string, string[]>;
      formErrors?: string[];
    };
  };
};

type ApiListResponse = {
  data: User[];
  meta: PaginationMeta;
};

type ApiItemResponse = {
  data: User;
};

type ListUsersParams = {
  page: number;
  limit: number;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorResponse;
    const details = body.error?.details;
    const fieldError =
      typeof details === "object" && details?.fieldErrors
        ? Object.values(details.fieldErrors).flat()[0]
        : undefined;
    const formError =
      typeof details === "object" ? details?.formErrors?.[0] : undefined;
    const databaseError = typeof details === "string" ? details : undefined;

    return (
      fieldError ??
      formError ??
      databaseError ??
      body.error?.message ??
      "Request failed."
    );
  } catch {
    return "Request failed.";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function listUsers(params: ListUsersParams): Promise<ApiListResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  return request<ApiListResponse>(`/api/users?${searchParams.toString()}`);
}

export async function createUser(input: UserInput): Promise<User> {
  const response = await request<ApiItemResponse>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function updateUser(id: number, input: UserInput): Promise<User> {
  const response = await request<ApiItemResponse>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await request<void>(`/api/users/${id}`, {
    method: "DELETE",
  });
}
