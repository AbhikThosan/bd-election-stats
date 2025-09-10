"use client";

import AuthForm from "@/components/AuthForm";
import { useRegisterMutation } from "@/store/apiSlice";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function RegisterPage() {
  const [register] = useRegisterMutation();

  return (
    <LayoutWrapper>
      <AuthForm type="register" onSubmit={register} />
    </LayoutWrapper>
  );
}
