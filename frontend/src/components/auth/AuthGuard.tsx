import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Spin } from 'antd';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = '/',
  requireAuth = false,
}) => {
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;

    // Check localStorage for persisted token
    const checkToken = () => {
      const persistedToken = localStorage.getItem('auth_token');
      const persistedUser = localStorage.getItem('auth_user');
      
      // If we have a token in localStorage, we're authenticated
      if (persistedToken && persistedUser) {
        setIsInitialized(true);
        return;
      }
      
      // If no token, we're also "initialized" (just not authenticated)
      setIsInitialized(true);
    };

    // Check immediately
    checkToken();

    // Also check after a small delay to ensure localStorage is available
    const timer = setTimeout(checkToken, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only run auth checks after initialization
    if (!isInitialized) return;

    // Check both Redux state and localStorage
    const persistedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const persistedUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    
    const isAuthenticated = (!!token && !!user) || (!!persistedToken && !!persistedUser);

    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      router.push('/login');
    } else if (!requireAuth && isAuthenticated) {
      // User is authenticated but shouldn't be on this page (e.g., register page)
      router.push(redirectTo);
    }
  }, [token, user, router, redirectTo, requireAuth, isInitialized]);

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Check both Redux state and localStorage for authentication
  const persistedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const persistedUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
  const isAuthenticated = (!!token && !!user) || (!!persistedToken && !!persistedUser);
  
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect to login
  }
  
  if (!requireAuth && isAuthenticated) {
    return null; // Will redirect to home/dashboard
  }

  return <>{children}</>;
};
