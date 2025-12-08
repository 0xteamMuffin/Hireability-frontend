'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api';
import { User, SignupPayload, SigninPayload } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signin: (payload: SigninPayload) => Promise<{ success: boolean; error?: string }>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; error?: string }>;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    const response = await authApi.getMe();
    if (response.success && response.data) {
      setUser(response.data.user);
    } else {
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signin = async (payload: SigninPayload) => {
    const response = await authApi.signin(payload);
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const signup = async (payload: SignupPayload) => {
    const response = await authApi.signup(payload);
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const signout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/signin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signin,
        signup,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
