import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

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

  useEffect(() => {
    const isAuthenticated = !!token && !!user;

    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      router.push('/login');
    } else if (!requireAuth && isAuthenticated) {
      // User is authenticated but shouldn't be on this page (e.g., register page)
      router.push(redirectTo);
    }
  }, [token, user, router, redirectTo, requireAuth]);

  // Don't render children if redirect is happening
  const isAuthenticated = !!token && !!user;
  
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect to login
  }
  
  if (!requireAuth && isAuthenticated) {
    return null; // Will redirect to home/dashboard
  }

  return <>{children}</>;
};
