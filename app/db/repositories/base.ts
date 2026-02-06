/**
 * Base Repository Interface
 * 
 * Defines common CRUD operations that all repositories should implement.
 * This is the foundation for the repository pattern.
 */

export interface BaseRepository<T, ID = string> {
  findById(id: ID): T | undefined;
  findAll(): T[];
  create(entity: Omit<T, 'id' | 'createdAt'>): T;
  update(id: ID, entity: Partial<T>): T | undefined;
  delete(id: ID): boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: unknown;
}

/**
 * Repository error class for consistent error handling
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

/**
 * Common error codes
 */
export const RepositoryErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE: 'DUPLICATE',
  INVALID_DATA: 'INVALID_DATA',
  DATABASE_ERROR: 'DATABASE_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;
