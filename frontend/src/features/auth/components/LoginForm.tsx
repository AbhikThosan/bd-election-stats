import React from 'react';
import { Form, Divider, Typography } from 'antd';
import { FormInput } from '@/components/ui/FormInput';
import { ElectionButton } from '@/components/ui/ElectionButton';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { useLoginForm } from '@/hooks/forms/useLoginForm';
import { useLogin } from '@/hooks/auth/useLogin';

const { Text, Link } = Typography;

export const LoginForm: React.FC = () => {
  const {
    formData,
    updateField,
    validateField,
    validateForm,
    getFormValues,
  } = useLoginForm();

  const { handleLogin, isLoading } = useLogin();

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const formValues = getFormValues();
    await handleLogin(formValues);
  };

  const handleFieldChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField(field, e.target.value);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your BD Election Statistics account"
    >
      <Form layout="vertical" className="space-y-4">
        {/* Email Field */}
        <Form.Item label="Email Address" className="mb-4">
          <FormInput
            icon="email"
            placeholder="Enter your email"
            value={formData.email.value}
            onChange={handleFieldChange('email')}
            onBlur={() => validateField('email', formData.email.value)}
            error={formData.email.error}
            touched={formData.email.touched}
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item label="Password" className="mb-6">
          <FormInput
            icon="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password.value}
            onChange={handleFieldChange('password')}
            onBlur={() => validateField('password', formData.password.value)}
            error={formData.password.error}
            touched={formData.password.touched}
          />
        </Form.Item>

        {/* Submit Button */}
        <ElectionButton
          loading={isLoading}
          onClick={handleSubmit}
          className="w-full"
        >
          Sign In
        </ElectionButton>

        {/* Divider */}
        <Divider>
          <Text className="text-gray-500">Don&apos;t have an account?</Text>
        </Divider>

        {/* Register Link */}
        <div className="text-center">
          <Link href="/register" className="text-blue-600 hover:text-blue-700">
            Create a new account
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
};