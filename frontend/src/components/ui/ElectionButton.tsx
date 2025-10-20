import React from 'react';
import { Button, ButtonProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface ElectionButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export const ElectionButton: React.FC<ElectionButtonProps> = ({
  loading = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <Button
      type="primary"
      size="large"
      // loading={loading}
      className={`h-12 font-medium ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <LoadingOutlined />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
};
