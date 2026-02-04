/* eslint-disable */
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

interface UseOptimizedQueryOptions<T> {
  queryKey: string;
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number; // milliseconds
  cacheTime?: number; // milliseconds
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  isStale: boolean;
}

// Simple in-memory cache
const queryCache = new Map<string, {
  data: unknown;
  timestamp: number;
  promises: Map<string, Promise<unknown>>;
}>();

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  retryCount = 1,
  retryDelay = 1000,
  onSuccess,
  onError,
}: UseOptimizedQueryOptions<T>): QueryState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    isLoading: enabled,
    isFetching: false,
    error: null,
    isStale: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Check if we have cached data
  const cachedEntry = useMemo(() => queryCache.get(queryKey), [queryKey]);
  const isCacheValid = useMemo(() => {
    if (!cachedEntry) return false;
    return Date.now() - cachedEntry.timestamp < staleTime;
  }, [cachedEntry, staleTime]);

  const executeQuery = useCallback(async (isBackground = false) => {
    if (!mountedRef.current) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isBackground) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    } else {
      setState(prev => ({ ...prev, isFetching: true }));
    }

    try {
      // Check for in-flight promise (deduplication)
      const cacheEntry = queryCache.get(queryKey);
      let promise = cacheEntry?.promises.get(queryKey);

      if (!promise) {
        promise = queryFn();
        if (!cacheEntry) {
          queryCache.set(queryKey, { 
            data: null, 
            timestamp: 0, 
            promises: new Map([[queryKey, promise]]) 
          });
        } else {
          cacheEntry.promises.set(queryKey, promise);
        }
      }

      const data = await promise as T;

      if (!mountedRef.current) return;

      // Update cache
      queryCache.set(queryKey, {
        data,
        timestamp: Date.now(),
        promises: new Map(),
      });

      setState({
        data,
        isLoading: false,
        isFetching: false,
        error: null,
        isStale: false,
      });

      retryCountRef.current = 0;
      onSuccess?.(data);
    } catch (error) {
      if (!mountedRef.current) return;

      // Don't treat abort as error
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      const err = error instanceof Error ? error : new Error(String(error));

      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => executeQuery(isBackground), retryDelay * retryCountRef.current);
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isFetching: false,
        error: err,
      }));

      onError?.(err);
    }
  }, [queryKey, queryFn, staleTime, retryCount, retryDelay, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Use cached data if available and valid
    if (cachedEntry && isCacheValid) {
      setState({
        data: cachedEntry.data as T,
        isLoading: false,
        isFetching: false,
        error: null,
        isStale: false,
      });

      // Background refresh if stale
      if (Date.now() - cachedEntry.timestamp > staleTime / 2) {
        executeQuery(true);
      }
    } else {
      executeQuery();
    }

    // Cleanup cache periodically
    const cleanup = setInterval(() => {
      const now = Date.now();
      queryCache.forEach((entry, key) => {
        if (now - entry.timestamp > cacheTime) {
          queryCache.delete(key);
        }
      });
    }, cacheTime);

    return () => {
      mountedRef.current = false;
      clearInterval(cleanup);
      abortControllerRef.current?.abort();
    };
  }, [enabled, queryKey, staleTime, cacheTime, cachedEntry, isCacheValid, executeQuery]);

  const refetch = useCallback(() => executeQuery(false), [executeQuery]);

  return { ...state, refetch };
}

// Hook for paginated queries
interface UsePaginatedQueryOptions<T> extends Omit<UseOptimizedQueryOptions<T>, 'queryFn'> {
  queryFn: (params: { page: number; limit: number }) => Promise<T>;
  page?: number;
  limit?: number;
}

export function usePaginatedQuery<T>({
  page = 1,
  limit = 50,
  ...options
}: UsePaginatedQueryOptions<T>) {
  const [currentPage, setCurrentPage] = useState(page);

  const queryFn = useCallback(() => {
    return options.queryFn({ page: currentPage, limit });
  }, [options.queryFn, currentPage, limit]);

  const result = useOptimizedQuery({
    ...options,
    queryKey: `${options.queryKey}?page=${currentPage}&limit=${limit}`,
    queryFn,
  });

  return {
    ...result,
    page: currentPage,
    setPage: setCurrentPage,
    limit,
  };
}

// Hook for infinite scroll
interface UseInfiniteQueryOptions<T> {
  queryKey: string;
  queryFn: (params: { cursor?: string; limit: number }) => Promise<{
    items: T[];
    nextCursor?: string;
    hasMore: boolean;
  }>;
  limit?: number;
  enabled?: boolean;
}

export function useInfiniteQuery<T>({
  queryKey,
  queryFn,
  limit = 50,
  enabled = true,
}: UseInfiniteQueryOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPage = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
      setItems([]);
      setCursor(undefined);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const result = await queryFn({ cursor, limit });
      
      if (isInitial) {
        setItems(result.items);
      } else {
        setItems(prev => [...prev, ...result.items]);
      }
      
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [queryFn, cursor, limit]);

  useEffect(() => {
    if (enabled) {
      fetchPage(true);
    }
  }, [enabled, queryKey]);

  const fetchMore = useCallback(() => {
    if (!isFetchingMore && hasMore) {
      fetchPage(false);
    }
  }, [isFetchingMore, hasMore, fetchPage]);

  const reset = useCallback(() => {
    setItems([]);
    setCursor(undefined);
    setHasMore(true);
    setError(null);
    fetchPage(true);
  }, [fetchPage]);

  return {
    items,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    fetchMore,
    reset,
  };
}
