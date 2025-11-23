"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Popconfirm,
  message,
  Empty,
  Spin,
  Pagination,
  Input,
  Select,
  Modal,
  Form,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  ReloadOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useApproveUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
} from "@/features/users/slices/usersApiSlice";
import { UserDetail } from "@/types/users";
import { useSocket } from "@/contexts/SocketContext";

const { Title, Text } = Typography;
const { Option } = Select;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { socket, isConnected } = useSocket();
  const [filters, setFilters] = useState<{
    email?: string;
    role?: "super_admin" | "admin" | "editor";
    status?: "pending" | "active";
  }>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetUsersQuery({
    page,
    limit,
    ...filters,
  });

  // Listen for new registration events to refresh user list
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewRegistration = () => {
      // Refetch users to show new pending registrations
      refetch();
    };

    socket.on("newRegistration", handleNewRegistration);

    return () => {
      socket.off("newRegistration", handleNewRegistration);
    };
  }, [socket, isConnected, refetch]);

  const { data: userDetail } = useGetUserByIdQuery(selectedUserId || "", {
    skip: !selectedUserId,
  });

  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
  const [updateUserRole, { isLoading: isUpdatingRole }] =
    useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();

  const handleApprove = async (user: UserDetail) => {
    try {
      await approveUser({
        id: user._id,
        data: { approve: true },
      }).unwrap();
      message.success("User approved successfully");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to approve user");
    }
  };

  const handleReject = async (user: UserDetail) => {
    try {
      await approveUser({
        id: user._id,
        data: { approve: false },
      }).unwrap();
      message.success("User rejected and deleted successfully");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to reject user");
    }
  };

  const handleEdit = (user: UserDetail) => {
    setSelectedUserId(user._id);
    form.setFieldsValue({ role: user.role });
    setEditModalVisible(true);
  };

  const handleUpdateRole = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedUserId) return;

      await updateUserRole({
        id: selectedUserId,
        data: { role: values.role },
      }).unwrap();
      message.success("User role updated successfully");
      setEditModalVisible(false);
      setSelectedUserId(null);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to update user role");
    }
  };

  const handleDelete = async (user: UserDetail) => {
    try {
      await deleteUser(user._id).unwrap();
      message.success("User deleted successfully");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to delete user");
    }
  };

  const handleResetPassword = (user: UserDetail) => {
    setSelectedUserId(user._id);
    resetPasswordForm.resetFields();
    setResetPasswordModalVisible(true);
  };

  const handleResetPasswordSubmit = async () => {
    try {
      const values = await resetPasswordForm.validateFields();
      if (!selectedUserId) return;

      await resetPassword({
        userId: selectedUserId,
        newPassword: values.newPassword,
      }).unwrap();
      message.success("Password reset successfully");
      setResetPasswordModalVisible(false);
      setSelectedUserId(null);
      resetPasswordForm.resetFields();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to reset password");
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (record: UserDetail) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.username}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Role",
      key: "role",
      render: (record: UserDetail) => {
        const colors: Record<string, string> = {
          super_admin: "red",
          admin: "blue",
          editor: "green",
        };
        return (
          <Tag color={colors[record.role] || "default"}>
            {record.role.replace("_", " ").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: UserDetail) => (
        <Space>
          {record.status === "pending" && (
            <>
              <Popconfirm
                title="Approve this user?"
                description="The user will be activated and can log in."
                onConfirm={() => handleApprove(record)}
                okText="Yes, Approve"
                cancelText="Cancel"
                okButtonProps={{ loading: isApproving }}
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  disabled={isApproving}
                  className="md:inline-flex"
                >
                  <span className="hidden md:inline">Approve</span>
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Reject this user?"
                description="The user account will be deleted permanently."
                onConfirm={() => handleReject(record)}
                okText="Yes, Reject"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: isApproving }}
              >
                <Button
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  disabled={isApproving}
                  className="md:inline-flex"
                >
                  <span className="hidden md:inline">Reject</span>
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === "active" && (
            <>
              <Button
                type="default"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(record)}
                className="md:inline-flex"
              >
                <span className="hidden md:inline">Edit Role</span>
              </Button>
              <Button
                type="default"
                icon={<KeyOutlined />}
                size="small"
                onClick={() => handleResetPassword(record)}
                className="md:inline-flex"
              >
                <span className="hidden md:inline">Reset Password</span>
              </Button>
              <Popconfirm
                title="Delete this user?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(record)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: isDeleting }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  disabled={isDeleting}
                  className="md:inline-flex"
                >
                  <span className="hidden md:inline">Delete</span>
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={["super_admin", "admin", "editor"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserOutlined className="text-2xl text-blue-600" />
              <Title level={2} className="!mb-0">
                User Management
              </Title>
            </div>
          </div>

          <Card>
            <div className="mb-4 flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Text strong>Email:</Text>
                <Input
                  placeholder="Search by email"
                  prefix={<SearchOutlined />}
                  value={filters.email}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                  allowClear
                />
              </div>
              <div className="min-w-[150px]">
                <Text strong>Role:</Text>
                <Select
                  placeholder="All roles"
                  style={{ width: "100%" }}
                  value={filters.role}
                  onChange={(value) => handleFilterChange("role", value)}
                  allowClear
                >
                  <Option value="super_admin">Super Admin</Option>
                  <Option value="admin">Admin</Option>
                  <Option value="editor">Editor</Option>
                </Select>
              </div>
              <div className="min-w-[150px]">
                <Text strong>Status:</Text>
                <Select
                  placeholder="All statuses"
                  style={{ width: "100%" }}
                  value={filters.status}
                  onChange={(value) => handleFilterChange("status", value)}
                  allowClear
                >
                  <Option value="pending">Pending</Option>
                  <Option value="active">Active</Option>
                </Select>
              </div>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : error ? (
              <Empty
                description="Failed to load users"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : !data?.users || data.users.length === 0 ? (
              <Empty
                description="No users found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <>
                <Table
                  columns={columns}
                  dataSource={data.users}
                  rowKey="_id"
                  pagination={false}
                  loading={isLoading}
                />
                {data.total > limit && (
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      current={page}
                      pageSize={limit}
                      total={data.total}
                      onChange={setPage}
                      showSizeChanger={false}
                      showTotal={(total) => `Total ${total} users`}
                    />
                  </div>
                )}
              </>
            )}
          </Card>

          <Modal
            title="Edit User Role"
            open={editModalVisible}
            onOk={handleUpdateRole}
            onCancel={() => {
              setEditModalVisible(false);
              setSelectedUserId(null);
              form.resetFields();
            }}
            confirmLoading={isUpdatingRole}
            okText="Update"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="role"
                label="Role"
                rules={[
                  { required: true, message: "Please select a role" },
                ]}
              >
                <Select placeholder="Select role">
                  <Option value="admin">Admin</Option>
                  <Option value="editor">Editor</Option>
                </Select>
              </Form.Item>
              {userDetail && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <Text type="secondary">
                    <strong>User:</strong> {userDetail.username} ({userDetail.email})
                  </Text>
                </div>
              )}
            </Form>
          </Modal>

          <Modal
            title="Reset Password"
            open={resetPasswordModalVisible}
            onOk={handleResetPasswordSubmit}
            onCancel={() => {
              setResetPasswordModalVisible(false);
              setSelectedUserId(null);
              resetPasswordForm.resetFields();
            }}
            confirmLoading={isResettingPassword}
            okText="Reset Password"
          >
            <Form form={resetPasswordForm} layout="vertical">
              {userDetail && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <Text type="secondary">
                    <strong>User:</strong> {userDetail.username} ({userDetail.email})
                  </Text>
                </div>
              )}
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: "Please enter a new password" },
                  { min: 8, message: "Password must be at least 8 characters" },
                ]}
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Please confirm the password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

