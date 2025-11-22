import React from "react";
import { Layout, Button, Badge } from "antd";
import {
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/slices/authCredentialSlice";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useGetNotificationsQuery } from "@/features/notifications/slices/notificationsApiSlice";

const { Header, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  // Get notification count for badge
  const { data: notificationsData } = useGetNotificationsQuery(
    { page: 1, limit: 1 },
    { skip: !isAuthenticated }
  );
  const notificationCount = notificationsData?.total || 0;

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  // Check if user has admin/editor/super_admin role
  const hasAdminAccess =
    isAuthenticated &&
    user &&
    (user.role === "super_admin" ||
      user.role === "admin" ||
      user.role === "editor");

  const isNotificationsActive = pathname === "/notifications";
  const isUsersActive = pathname === "/users";

  return (
    <Layout className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header className="bg-linear-to-r from-red-600 via-red-500 to-green-600 shadow-sm border-b border-red-700/20 px-6 flex items-center justify-between shrink-0 h-16">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 group cursor-pointer transition-all duration-200 hover:opacity-80"
          >
            <div className="flex items-center">
              <span className="text-xl font-extrabold bg-linear-to-r from-red-600 to-green-500 bg-clip-text text-transparent">
                BD
              </span>
              <span className="text-xl font-extrabold text-white">
                Election
              </span>
              <span className="text-xl font-extrabold bg-linear-to-r from-red-600 to-green-500 bg-clip-text text-transparent">
                Stats
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasAdminAccess && (
            <div className="flex items-center">
              <Button
                type="text"
                icon={
                  <Badge
                    count={notificationCount}
                    size="small"
                    offset={[-2, 2]}
                  >
                    <BellOutlined className="text-lg text-white! drop-shadow-lg" />
                  </Badge>
                }
                onClick={() => router.push("/notifications")}
                className={`flex items-center justify-center transition-all ${
                  isNotificationsActive
                    ? "text-white bg-white/25 hover:bg-white/35 shadow-md"
                    : "text-white hover:text-white hover:bg-white/15"
                }`}
                size="large"
                style={{
                  minWidth: "48px",
                  height: "48px",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                }}
              />
              <Button
                type="text"
                icon={
                  <UserOutlined className="text-lg text-white! drop-shadow-lg" />
                }
                onClick={() => router.push("/users")}
                className={`flex items-center justify-center transition-all ${
                  isUsersActive
                    ? "text-white bg-white/25 hover:bg-white/35 shadow-md"
                    : "text-white hover:text-white hover:bg-white/15"
                }`}
                size="large"
                style={{
                  minWidth: "48px",
                  height: "48px",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                }}
              />
            </div>
          )}
          {isAuthenticated ? (
            <Button
              type="text"
              icon={<LogoutOutlined className=" drop-shadow-md" />}
              onClick={handleLogout}
              className="text-white! hover:text-red-500! bg-white/15! transition-all"
              size="large"
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
              }}
            >
              <span className="hidden sm:inline drop-shadow-md">Logout</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="default"
                icon={<UserAddOutlined />}
                onClick={handleRegister}
                className="text-gray-700 hover:text-gray-900"
                size="middle"
              >
                <span className="hidden sm:inline">Register</span>
              </Button>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={handleLogin}
                className="text-blue-600 hover:text-blue-700"
                size="middle"
              >
                <span className="hidden sm:inline">Login</span>
              </Button>
            </div>
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
