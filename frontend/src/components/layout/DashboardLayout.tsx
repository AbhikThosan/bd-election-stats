import React from "react";
import { Layout, Typography, Button } from "antd";
import { LogoutOutlined, LoginOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/slices/authCredentialSlice";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";

const { Header, Content } = Layout;
const { Title } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <Layout className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        className="bg-white shadow-sm border-b border-gray-100 px-4 lg:px-6 flex items-center justify-between flex-shrink-0"
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
          {isAuthenticated ? (
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 hover:bg-red-50"
              size="middle"
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleLogin}
              className="text-blue-600 hover:text-blue-700"
              size="middle"
            >
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}
        </div>
      </Header>

      {/* Main Content */}
      <Content className="p-4 lg:p-6 flex-1">
        <div className="max-w-7xl mx-auto min-h-full">{children}</div>
      </Content>
    </Layout>
  );
};
