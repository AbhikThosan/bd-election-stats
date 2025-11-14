import React from "react";
import { Layout, Typography, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/features/auth/slices/authCredentialSlice";
import { useRouter } from "next/navigation";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        className="bg-white shadow-sm border-b border-gray-100 px-4 lg:px-6 flex items-center justify-between"
        style={{
          background: "#ffffff",
          height: "64px",
          lineHeight: "64px",
          padding: "0 24px",
        }}
      >
        <div className="flex items-center space-x-4">
          <Title level={4} className="mb-0 text-gray-800 font-semibold">
            BD Election Stats
          </Title>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications */}
          {/* <Button 
            type="text" 
            icon={<BellOutlined />} 
            className="text-gray-500 hover:text-blue-500 hover:bg-blue-50"
            size="middle"
          /> */}

          {/* User Info */}
          {/* <div className="flex items-center space-x-2">
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              className="bg-blue-100 text-blue-600"
            />
            <div className="hidden sm:block">
              <Text className="text-sm font-medium text-gray-700">
                {user?.username}
              </Text>
              <br />
              <Text className="text-xs text-gray-400 capitalize">
                {user?.role}
              </Text>
            </div>
          </div> */}

          {/* Logout Button */}
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500 hover:bg-red-50"
            size="middle"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </Header>

      {/* Main Content */}
      <Content className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </Content>
    </Layout>
  );
};
