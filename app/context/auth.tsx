import React, { createContext, useContext, useState, useCallback } from 'react';
import database from '../../db';
import type User from '../../models/user';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


const userCache = new Map<string, User>();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (userId: string) => {
    console.time('auth-context-login');
    try {
      console.time('user-lookup');
      let foundUser = userCache.get(userId);
      
      if (!foundUser) {
        foundUser = await database.get<User>('users').find(userId);
        if (foundUser) {
          userCache.set(userId, foundUser);
        }
      }
      console.timeEnd('user-lookup');

      if (!foundUser) {
        throw new Error('User not found');
      }

      setUser(foundUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      console.timeEnd('auth-context-login');
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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