export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function getPaginationParams(query: PaginationParams): {
  limit: number;
  offset: number;
  page: number;
} {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  let limit = Number(query.limit) || DEFAULT_LIMIT;

  limit = Math.min(limit, MAX_LIMIT);

  const offset = (page - 1) * limit;

  return { limit, offset, page };
}

export function createPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    meta: createPaginationMeta(total, page, limit),
  };
}
