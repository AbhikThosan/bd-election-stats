"use client";

import LoginForm from "@/features/auth/components/LoginForm";
import { useLoginMutation } from "@/features/auth/slices/authApiSlice";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function LoginPage() {
  const [login] = useLoginMutation();

  return (
    <LayoutWrapper>
      <LoginForm onSubmit={login} />
    </LayoutWrapper>
  );
}
