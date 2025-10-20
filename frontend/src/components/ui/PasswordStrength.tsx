import React from 'react';
import { Progress } from 'antd';
import { getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/utils/validation';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  className = '',
}) => {
  const strength = getPasswordStrength(password);
  const label = getPasswordStrengthLabel(strength);
  const color = getPasswordStrengthColor(strength);

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Strength:</span>
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
      </div>
      <Progress
        percent={(strength / 5) * 100}
        showInfo={false}
        strokeColor={color}
        className="password-strength-progress"
        size="small"
      />
    </div>
  );
};
