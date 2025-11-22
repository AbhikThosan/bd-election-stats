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
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  BellOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useGetNotificationsQuery,
  useUpdateNotificationMutation,
} from "@/features/notifications/slices/notificationsApiSlice";
import { Notification } from "@/types/notifications";
import { formatDistanceToNow } from "date-fns";
import { useSocket } from "@/contexts/SocketContext";

const { Title, Text } = Typography;

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { socket, isConnected } = useSocket();
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetNotificationsQuery({ page, limit });
  const [updateNotification, { isLoading: isUpdating }] =
    useUpdateNotificationMutation();

  // Listen for new registration notifications
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewRegistration = (data: {
      notificationId: string;
      userId: string;
      email: string;
      username: string;
      role: string;
    }) => {
      console.log("New registration notification received:", data);
      message.info(`New registration request from ${data.username} (${data.email})`);
      // Refetch notifications to show the new one
      refetch();
    };

    socket.on("newRegistration", handleNewRegistration);

    return () => {
      socket.off("newRegistration", handleNewRegistration);
    };
  }, [socket, isConnected, refetch]);

  const handleApprove = async (notification: Notification) => {
    try {
      await updateNotification({
        id: notification._id,
        data: { status: "approved" },
      }).unwrap();
      message.success("Registration approved successfully");
      refetch();
    } catch (error: any) {
      message.error(
        error?.data?.message || "Failed to approve registration"
      );
    }
  };

  const handleReject = async (notification: Notification) => {
    try {
      await updateNotification({
        id: notification._id,
        data: { status: "rejected" },
      }).unwrap();
      message.success("Registration rejected successfully");
      refetch();
    } catch (error: any) {
      message.error(
        error?.data?.message || "Failed to reject registration"
      );
    }
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (record: Notification) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            <UserOutlined /> {record.username}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <MailOutlined /> {record.email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Role",
      key: "role",
      render: (record: Notification) => (
        <Tag color={record.role === "admin" ? "blue" : "green"}>
          {record.role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Type",
      key: "type",
      render: (record: Notification) => (
        <Tag color="orange">
          {record.type.replace("_", " ").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: Notification) => (
        <Tag color={record.status === "pending" ? "orange" : "default"}>
          {record.status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Requested",
      key: "createdAt",
      render: (record: Notification) => (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {formatDistanceToNow(new Date(record.createdAt), {
            addSuffix: true,
          })}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Notification) => (
        <Space>
          <Popconfirm
            title="Approve this registration?"
            description="The user will be activated and can log in."
            onConfirm={() => handleApprove(record)}
            okText="Yes, Approve"
            cancelText="Cancel"
            okButtonProps={{ loading: isUpdating }}
          >
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              disabled={isUpdating}
            >
              Approve
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Reject this registration?"
            description="The user account will be deleted permanently."
            onConfirm={() => handleReject(record)}
            okText="Yes, Reject"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: isUpdating }}
          >
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              disabled={isUpdating}
            >
              Reject
            </Button>
          </Popconfirm>
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
              <BellOutlined className="text-2xl text-blue-600" />
              <Title level={2} className="!mb-0">
                Registration Notifications
              </Title>
            </div>
          </div>

          <Card>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : error ? (
              <Empty
                description="Failed to load notifications"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : !data?.notifications || data.notifications.length === 0 ? (
              <Empty
                description="No pending notifications"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <>
                <Table
                  columns={columns}
                  dataSource={data.notifications}
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
                      showTotal={(total) => `Total ${total} notifications`}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

