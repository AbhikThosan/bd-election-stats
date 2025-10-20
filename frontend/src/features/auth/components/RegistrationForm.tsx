import React from 'react';
import { Form, Divider, Typography } from 'antd';
import { FormInput } from '@/components/ui/FormInput';
import { PasswordStrength } from '../../../components/ui/PasswordStrength';
import { RoleSelect } from '@/components/ui/RoleSelect';
import { ElectionButton } from '@/components/ui/ElectionButton';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { useRegistrationForm } from '@/hooks/forms/useRegistrationForm';
import { useRegistration } from '@/hooks/auth/useRegistration';
import { RegistrationRequest } from '@/types/api';

const { Text, Link } = Typography;

export const RegistrationForm: React.FC = () => {
  const {
    formData,
    updateField,
    validateField,
    validateForm,
    getFormValues,
  } = useRegistrationForm();

  const { handleRegistration, isLoading } = useRegistration();
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const formValues = getFormValues();
    await handleRegistration(formValues as RegistrationRequest);
  };

  const handleFieldChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField(field, e.target.value);
  };

  const handleRoleChange = (value: string) => {
    updateField('role', value);
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the BD Election Statistics platform"
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

        {/* Username Field */}
        <Form.Item label="Username" className="mb-4">
          <FormInput
            icon="username"
            placeholder="Choose a username"
            value={formData.username.value}
            onChange={handleFieldChange('username')}
            onBlur={() => validateField('username', formData.username.value)}
            error={formData.username.error}
            touched={formData.username.touched}
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item label="Password" className="mb-4">
          <FormInput
            icon="password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password.value}
            onChange={handleFieldChange('password')}
            onBlur={() => validateField('password', formData.password.value)}
            error={formData.password.error}
            touched={formData.password.touched}
          />
          <PasswordStrength password={formData.password.value} />
        </Form.Item>

        {/* Confirm Password Field */}
        <Form.Item label="Confirm Password" className="mb-4">
          <FormInput
            icon="password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword.value}
            onChange={handleFieldChange('confirmPassword')}
            onBlur={() => validateField('confirmPassword', formData.confirmPassword.value)}
            error={formData.confirmPassword.error}
            touched={formData.confirmPassword.touched}
          />
        </Form.Item>

        {/* Role Selection */}
        <Form.Item label="Role" className="mb-6">
          <RoleSelect
            value={formData.role.value}
            onChange={handleRoleChange}
            onBlur={() => validateField('role', formData.role.value)}
            error={formData.role.error}
            touched={formData.role.touched}
          />
        </Form.Item>

        {/* Submit Button */}
        <ElectionButton
          loading={isLoading}
          onClick={handleSubmit}
          className="w-full"
        >
          Create Account
        </ElectionButton>

        {/* Divider */}
        <Divider>
          <Text className="text-gray-500">Already have an account?</Text>
        </Divider>

        {/* Login Link */}
        <div className="text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-700">
            Sign in to your account
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
};
