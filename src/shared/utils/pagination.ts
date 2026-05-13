import { PaginatedResult, PaginationParams } from './domain';

export const calculatePagination = (
  page: number,
  limit: number,
  total: number
): Omit<PaginatedResult<any>, 'items'> => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    totalPages,
    total,
    hasNextPage,
    hasPreviousPage,
  };
};

export const validatePaginationParams = (
  page?: number,
  limit?: number
): PaginationParams => {
  const validPage = Math.max(1, page || 1);
  const validLimit = Math.min(100, Math.max(1, limit || 25));

  return {
    page: validPage,
    limit: validLimit,
  };
};
