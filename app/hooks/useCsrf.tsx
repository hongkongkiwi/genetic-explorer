import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface CsrfContextType {
  token: string | null;
  refreshToken: () => Promise<void>;
  getHeaders: () => HeadersInit;
}

const CsrfContext = createContext<CsrfContextType | null>(null);

function getCsrfTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/csrf');
    if (response.ok) {
      const data = await response.json();
      return data.token || null;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
  return null;
}

export function CsrfProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const cookieToken = getCsrfTokenFromCookie();
    if (cookieToken) {
      setToken(cookieToken);
    } else {
      fetchCsrfToken().then(setToken);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    const newToken = await fetchCsrfToken();
    setToken(newToken);
  }, []);

  const getHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const currentToken = token || getCsrfTokenFromCookie();
    if (currentToken) {
      headers['X-CSRF-Token'] = currentToken;
    }
    
    return headers;
  }, [token]);

  return (
    <CsrfContext.Provider value={{ token, refreshToken, getHeaders }}>
      {children}
    </CsrfContext.Provider>
  );
}

export function useCsrf() {
  const context = useContext(CsrfContext);
  if (!context) {
    throw new Error('useCsrf must be used within a CsrfProvider');
  }
  return context;
}

export function useSecureFetch() {
  const { getHeaders, refreshToken } = useCsrf();

  const secureFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || '');
    
    if (isMutation) {
      const csrfHeaders = getHeaders();
      options.headers = {
        ...csrfHeaders,
        ...options.headers,
      };
    }

    const response = await fetch(url, options);

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error?.includes('CSRF')) {
        await refreshToken();
        const newHeaders = getHeaders();
        options.headers = {
          ...newHeaders,
          ...options.headers,
        };
        return fetch(url, options);
      }
    }

    return response;
  }, [getHeaders, refreshToken]);

  return secureFetch;
}
