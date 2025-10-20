import React from 'react';
import { Input, InputProps } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

interface FormInputProps extends Omit<InputProps, 'prefix'> {
  icon?: 'email' | 'username' | 'password';
  error?: string;
  touched?: boolean;
}

const iconMap = {
  email: <MailOutlined className="text-gray-400" />,
  username: <UserOutlined className="text-gray-400" />,
  password: <LockOutlined className="text-gray-400" />,
};

export const FormInput: React.FC<FormInputProps> = ({
  icon,
  error,
  touched,
  className = '',
  ...props
}) => {
  const hasError = touched && error;
  
  return (
    <div className="w-full">
      <Input
        prefix={icon ? iconMap[icon] : undefined}
        status={hasError ? 'error' : undefined}
        className={`h-11 ${className}`}
        {...props}
      />
      {hasError && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};
