"use client";

import React from 'react';
import { Button, Card, Typography, Space } from 'antd';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/slices/authCredentialSlice';
import { User } from '@/types/auth';

const { Title, Text } = Typography;

export default function TestAuthPage() {
  const dispatch = useDispatch();

  const simulateLogin = () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      role: 'editor',
    };

    dispatch(setCredentials({
      token: 'mock-jwt-token',
      user: mockUser,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Title level={2} className="text-gray-900 font-bold">
            Test Authentication
          </Title>
          <Text className="text-gray-600 text-base">
            Simulate login to test authentication guards
          </Text>
        </div>

        <Card className="shadow-lg border-0">
          <div className="text-center space-y-4">
            <Button 
              type="primary" 
              onClick={simulateLogin}
              className="w-full"
            >
              Simulate Login
            </Button>
            
            <Space direction="vertical" className="w-full">
              <Button 
                href="/register"
                className="w-full"
              >
                Try to Access Register Page
              </Button>
              <Button 
                href="/login"
                className="w-full"
              >
                Try to Access Login Page
              </Button>
              <Button 
                href="/"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
}
