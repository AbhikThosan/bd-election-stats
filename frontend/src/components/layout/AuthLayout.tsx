import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Title level={2} className="text-gray-900 font-bold">
            {title}
          </Title>
          {subtitle && (
            <Text className="text-gray-600 text-base">
              {subtitle}
            </Text>
          )}
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-0">
          {children}
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Text className="text-gray-500 text-sm">
            BD Election Statistics Platform
          </Text>
        </div>
      </div>
    </div>
  );
};
