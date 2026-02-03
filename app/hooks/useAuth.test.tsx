import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './useAuth';
import type { ReactNode } from 'react';

// Mock fetch
global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('initializes with loading state', () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, user: null }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets user when authenticated', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: '2024-01-01',
      emailVerified: true,
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, user: mockUser }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('handles login successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: '2024-01-01',
      emailVerified: true,
    };

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let loginResult: { success: boolean; error?: string };
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password');
    });

    expect(loginResult!.success).toBe(true);
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(result.current.user).toEqual(mockUser);
  });

  it('handles login failure', async () => {
    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: null }),
      })
      .mockResolvedValueOnce({
        ok: 401,
        json: async () => ({ success: false, error: 'Invalid credentials' }),
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const loginResult = await result.current.login('test@example.com', 'wrongpassword');

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Invalid credentials');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles logout', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: '2024-01-01',
      emailVerified: true,
    };

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
    expect(result.current.user).toBeNull();
  });

  it('handles registration', async () => {
    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const registerResult = await result.current.register(
      'newuser@example.com',
      'password123',
      'New User'
    );

    expect(registerResult.success).toBe(true);
  });

  it('handles registration failure', async () => {
    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: null }),
      })
      .mockResolvedValueOnce({
        ok: 400,
        json: async () => ({ success: false, error: 'Email already exists' }),
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const registerResult = await result.current.register(
      'existing@example.com',
      'password123'
    );

    expect(registerResult.success).toBe(false);
    expect(registerResult.error).toBe('Email already exists');
  });
});
