export type User = {
  id: number;
  userName: string;
  country: string;
  position: string;
  salary: number;
  department: string;
  yearsOfService: number;
};

export type UserInput = Omit<User, "id">;

export type UserSortOrder = "asc" | "desc";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
