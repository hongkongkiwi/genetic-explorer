import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  emailVerified: boolean;
  profile?: {
    bio: string | null;
    birthDate: string | null;
    sex: string | null;
    ancestry: string | null;
    timezone: string;
    privacySettings: {
      shareAnonymized: boolean;
      allowFamilySharing: boolean;
    };
  };
  termsStatus?: {
    hasAcceptedCurrentTerms: boolean;
    hasAcceptedCurrentPrivacy: boolean;
    currentTermsVersion: string;
    currentPrivacyVersion: string;
    userTermsVersion?: string;
    userPrivacyVersion?: string;
    acceptedAt?: string;
    requiresReacceptance: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ 
    success: boolean; 
    error?: string;
    requires2FA?: boolean;
    pendingToken?: string;
    methods?: string[];
    requiresTermsAcceptance?: boolean;
    termsStatus?: {
      hasAcceptedCurrentTerms: boolean;
      hasAcceptedCurrentPrivacy: boolean;
      currentTermsVersion: string;
      currentPrivacyVersion: string;
      userTermsVersion?: string;
      userPrivacyVersion?: string;
      acceptedAt?: string;
      requiresReacceptance: boolean;
    };
    user?: User;
  }>;
  register: (email: string, password: string, displayName?: string, acceptTerms?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  disconnectOAuth: (provider: 'google' | 'github') => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          
          // Check if user needs to accept new terms
          if (data.user.termsStatus?.requiresReacceptance) {
            // Redirect to terms acceptance page
            if (typeof window !== 'undefined') {
              window.location.href = '/accept-terms';
            }
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setUser(null);
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser().finally(() => setIsLoading(false));
  }, [fetchCurrentUser]);

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success) {
        // Check if terms acceptance is required
        if (data.requiresTermsAcceptance) {
          return {
            success: true,
            requiresTermsAcceptance: true,
            termsStatus: data.termsStatus,
            user: data.user,
          };
        }
        
        // Check if 2FA is required
        if (data.requires2FA) {
          return { 
            success: true, 
            requires2FA: true,
            pendingToken: data.pendingToken,
            methods: data.methods,
            user: data.user,
          };
        }
        
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, displayName?: string, acceptTerms?: boolean) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, acceptTerms }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  const disconnectOAuth = useCallback(async (provider: 'google' | 'github') => {
    try {
      const response = await fetch('/api/auth/oauth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchCurrentUser();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Disconnect OAuth error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        disconnectOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
