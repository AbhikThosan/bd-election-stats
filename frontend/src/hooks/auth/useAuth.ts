import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;

    // Check both Redux state and localStorage
    const persistedToken = localStorage.getItem('auth_token');
    const persistedUser = localStorage.getItem('auth_user');
    
    const authenticated = (!!token && !!user) || (!!persistedToken && !!persistedUser);
    setIsAuthenticated(authenticated);
    setIsInitialized(true);
  }, [token, user]);

  const getUser = () => {
    if (user) return user;
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  return {
    isAuthenticated,
    isInitialized,
    user: getUser(),
    token: token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null),
  };
};

