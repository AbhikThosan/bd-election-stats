import React from 'react';
import { Select, SelectProps } from 'antd';
import { ROLE_OPTIONS } from '@/constants/auth';

interface RoleSelectProps extends Omit<SelectProps, 'options'> {
  error?: string;
  touched?: boolean;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({
  error,
  touched,
  className = '',
  ...props
}) => {
  const hasError = touched && error;
  
  return (
    <div className="w-full">
      <Select
        status={hasError ? 'error' : undefined}
        className={`w-full h-11 ${className}`}
        placeholder="Select your role"
        optionLabelProp="label"
        {...props}
      >
        {ROLE_OPTIONS.map((option) => (
          <Select.Option key={option.value} value={option.value} label={option.label}>
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-sm text-gray-500">{option.description}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
      {hasError && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};
