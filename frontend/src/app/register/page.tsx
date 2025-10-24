"use client";

import { RegistrationForm } from "@/features/auth/components/RegistrationForm";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

export default function RegisterPage() {
  return (
    <GuestOnlyGuard redirectTo="/">
      <RegistrationForm />
    </GuestOnlyGuard>
  );
}
