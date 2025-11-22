import React from "react";
import { Card, Typography, Layout, Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { Header } = Layout;

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
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <Layout className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Logo */}
      <Header className="bg-linear-to-r from-red-600 via-red-500 to-green-600 shadow-sm border-b border-red-700/20 px-4 lg:px-6 flex items-center justify-between shrink-0 h-16">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 group cursor-pointer transition-all duration-200 hover:opacity-80"
        >
          <div className="flex items-center">
            <span className="text-xl font-extrabold bg-linear-to-r from-red-600 to-green-500 bg-clip-text text-transparent">
              BD
            </span>
            <span className="text-xl font-extrabold text-white">Election</span>
            <span className="text-xl font-extrabold bg-linear-to-r from-red-600 to-green-500 bg-clip-text text-transparent">
              Stats
            </span>
          </div>
        </button>
        <Button
          type="default"
          icon={<HomeOutlined />}
          onClick={handleHomeClick}
          className="bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 border-white/30 shadow-sm font-medium"
          size="middle"
        >
          <span className="hidden sm:inline">Home</span>
        </Button>
      </Header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Page Title */}
          <div className="text-center">
            <Title level={2} className="text-gray-900 font-bold">
              {title}
            </Title>
            {subtitle && (
              <Text className="text-gray-600 text-base">{subtitle}</Text>
            )}
          </div>

          {/* Form Card */}
          <Card className="shadow-lg border-0">{children}</Card>

          {/* Footer */}
          <div className="text-center">
            <Text className="text-gray-500 text-sm">
              BD Election Statistics Platform
            </Text>
          </div>
        </div>
      </div>
    </Layout>
  );
};
