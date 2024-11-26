'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Interface for the User object.
interface User {
  id: string;
  email: string;
  token: string;
}

// Interface for the AuthContextType.
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

// Create the AuthContext.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @dev AuthProvider component for managing authentication state.
 * @param children - The child components.
 * @returns A React component that provides the authentication context.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check the authentication status when the component mounts.
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * @dev Checks the authentication status by fetching the session data.
   */
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @dev Logs in the user by setting the user data.
   * @param userData - The user data to be set.
   */
  const login = (userData: User) => {
    setUser(userData);
  };

  /**
   * @dev Logs out the user by clearing the user data and redirecting to the home page.
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // If the authentication status is still loading, return null or a loading spinner.
  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * @dev Custom hook for accessing the authentication context.
 * @returns The authentication context.
 * @throws Error if used outside of an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}