"use client";

import RegisterForm from "@/features/auth/components/RegisterForm";
import { useRegisterMutation } from "@/features/auth/slices/authApiSlice";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function RegisterPage() {
  const [register] = useRegisterMutation();

  return (
    <LayoutWrapper>
      <RegisterForm onSubmit={register} />
    </LayoutWrapper>
  );
}
