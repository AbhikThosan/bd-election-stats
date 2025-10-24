import React from 'react';
import { Layout, Typography, Button, Space, Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/features/auth/slices/authCredentialSlice';
import { useRouter } from 'next/navigation';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header className="bg-white shadow-sm border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Title level={3} className="mb-0 text-blue-600">
            BD Election Stats
          </Title>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button 
            type="text" 
            icon={<BellOutlined />} 
            className="text-gray-600 hover:text-blue-600"
          />

          {/* User Menu */}
          <Dropdown overlay={userMenu} placement="bottomRight" arrow>
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <Avatar 
                size="small" 
                icon={<UserOutlined />} 
                className="bg-blue-500"
              />
              <div className="hidden sm:block">
                <Text className="text-sm font-medium text-gray-900">
                  {user?.username}
                </Text>
                <br />
                <Text className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </Text>
              </div>
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* Main Content */}
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </Content>
    </Layout>
  );
};
