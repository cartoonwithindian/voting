"use client";

/**
 * Authentication Context
 * Provides user authentication state throughout the app
 *
 * Uses real backend authentication endpoints:
 * - GET /api/v1/auth/me - Check current session
 * - POST /api/v1/auth/login - Login
 * - POST /api/v1/auth/logout - Logout
 * - POST /api/v1/auth/mfa/verify - MFA verification
 * - GET /api/v1/auth/csrf - Get CSRF token
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api, MeResponse, LoginResponse } from "./api-client";

export type UserRole = "student" | "candidate" | "administrator";

export interface User {
  id: number;
  name: string;
  email: string;
  externalId?: string;
  role: UserRole;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  mfaRequired: boolean;
  mfaChallenge: string | null;
  enrollmentToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<{ success: boolean; mfaRequired?: boolean }>;
  verifyMfa: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  clearMfa: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to normalize backend role to frontend role
function normalizeRole(role: string): UserRole {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return 'administrator';
    case 'CANDIDATE':
      return 'candidate';
    case 'STUDENT':
    default:
      return 'student';
  }
}

// Helper to convert backend user to frontend user
function toFrontendUser(backendUser: MeResponse['user']): User | null {
  if (!backendUser) return null;
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    externalId: backendUser.externalId,
    role: normalizeRole(backendUser.role),
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
    mfaRequired: false,
    mfaChallenge: null,
    enrollmentToken: null,
  });

  const checkSession = useCallback(async (): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.getMe();

      if (response.error || !response.data) {
        // Not authenticated or session expired
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
          mfaRequired: false,
          mfaChallenge: null,
          enrollmentToken: null,
        });
        return false;
      }

      // Session is valid
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: toFrontendUser(response.data.user),
        error: null,
        mfaRequired: false,
        mfaChallenge: null,
        enrollmentToken: null,
      });
      return true;
    } catch (error) {
      console.error('Session check error:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
        mfaRequired: false,
        mfaChallenge: null,
        enrollmentToken: null,
      });
      return false;
    }
  }, []);

  // Check current session on mount
  useEffect(() => {
    const run = async () => {
      await checkSession();
    };
    run();
  }, [checkSession]);

  const login = useCallback(async (identifier: string, password: string): Promise<{ success: boolean; mfaRequired?: boolean }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.login(identifier, password);

      if (response.error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Login failed',
        }));
        return { success: false };
      }

      const data = response.data as LoginResponse;

      if (data.mfaRequired) {
        // MFA required - store challenge for verification
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          mfaRequired: true,
          mfaChallenge: data.mfaChallenge || null,
          enrollmentToken: data.enrollmentToken || null,
          error: null,
        }));
        return { success: false, mfaRequired: true };
      }

      if (data.authenticated && data.user) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: toFrontendUser(data.user as unknown as MeResponse['user']),
          error: null,
          mfaRequired: false,
          mfaChallenge: null,
          enrollmentToken: null,
        });
        return { success: true };
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed',
      }));
      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed',
      }));
      return { success: false };
    }
  }, []);

  const verifyMfa = useCallback(async (code: string): Promise<boolean> => {
    const challenge = authState.mfaChallenge;
    if (!challenge) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: 'No MFA challenge active' }));
      return false;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.verifyMfa(challenge, code);

      if (response.error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'MFA verification failed',
        }));
        return false;
      }

      // MFA successful, re-check session and return its result
      const isAuth = await checkSession();
      return isAuth;
    } catch (error) {
      console.error('MFA verification error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'MFA verification failed',
      }));
      return false;
    }
  }, [authState.mfaChallenge, checkSession]);

  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
        mfaRequired: false,
        mfaChallenge: null,
        enrollmentToken: null,
      });
    }
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    // This is for UI demo purposes only - does not change actual backend role
    setAuthState(prev => {
      if (!prev.user) return prev;
      return { ...prev, user: { ...prev.user, role } };
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      return { ...prev, user: { ...prev.user, ...updates } };
    });
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const clearMfa = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      mfaRequired: false,
      mfaChallenge: null,
      enrollmentToken: null,
    }));
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    verifyMfa,
    logout,
    switchRole,
    updateUser,
    clearError,
    clearMfa,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
