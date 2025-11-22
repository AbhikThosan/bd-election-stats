"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spin, Result, Button } from "antd";
import { useAuth } from "@/hooks/auth/useAuth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("super_admin" | "admin" | "editor")[];
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = "/",
}) => {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    const userRole = user.role;
    const access = allowedRoles.includes(userRole);
    setHasAccess(access);

    if (!access) {
      // User doesn't have required role
      setTimeout(() => {
        router.push(redirectTo);
      }, 2000);
    }
  }, [isAuthenticated, isInitialized, user, allowedRoles, router, redirectTo]);

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  if (hasAccess === false) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={
            <Button type="primary" onClick={() => router.push(redirectTo)}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  if (hasAccess === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
};

