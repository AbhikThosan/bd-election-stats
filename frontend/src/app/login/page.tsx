"use client";

import AuthForm from "@/components/AuthForm";
import { useLoginMutation } from "@/store/apiSlice";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function LoginPage() {
  const [login] = useLoginMutation();

  return (
    <LayoutWrapper>
      <AuthForm type="login" onSubmit={login} />
    </LayoutWrapper>
  );
}
