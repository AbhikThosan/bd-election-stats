"use client";

import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/features/auth/slices/authCredentialSlice';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Title level={2} className="text-gray-900 font-bold">
            Welcome to Dashboard
          </Title>
          <Text className="text-gray-600 text-base">
            BD Election Statistics Platform
          </Text>
        </div>

        {/* User Info Card */}
        <Card className="shadow-lg border-0">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
              <UserOutlined className="text-2xl text-blue-600" />
            </div>
            
            <div>
              <Title level={3} className="mb-2">
                {user?.username}
              </Title>
              <Text className="text-gray-600 block mb-1">
                {user?.email}
              </Text>
              <Text className="text-blue-600 font-medium capitalize">
                {user?.role}
              </Text>
            </div>

            <Space direction="vertical" className="w-full">
              <Button 
                type="primary" 
                danger 
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="w-full"
              >
                Logout
              </Button>
            </Space>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Text className="text-gray-500 text-sm">
            You are successfully logged in!
          </Text>
        </div>
      </div>
    </div>
  );
}