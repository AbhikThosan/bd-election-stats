import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface GuestOnlyGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const GuestOnlyGuard: React.FC<GuestOnlyGuardProps> = ({
  children,
  redirectTo = '/',
}) => {
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const isAuthenticated = !!token && !!user;

    if (isAuthenticated) {
      // User is already logged in, redirect them away from guest-only pages
      console.log('User is authenticated, redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [token, user, router, redirectTo]);

  // Don't render children if user is authenticated (will redirect)
  const isAuthenticated = !!token && !!user;
  
  if (isAuthenticated) {
    return null; // Will redirect to home/dashboard
  }

  return <>{children}</>;
};
