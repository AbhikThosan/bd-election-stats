"use client";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

export default function LoginPage() {
  return (
    <GuestOnlyGuard redirectTo="/">
      <LoginForm />
    </GuestOnlyGuard>
  );
}
