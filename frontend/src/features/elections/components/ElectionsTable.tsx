import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic,
  message,
  Popconfirm
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useGetElectionsQuery, useDeleteElectionMutation, Election } from '@/features/elections/slices/electionsApiSlice';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

const { Title, Text } = Typography;

export const ElectionsTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();
  
  const { data, isLoading, error } = useGetElectionsQuery({ 
    page: currentPage, 
    limit: pageSize 
  });
  
  const [deleteElection] = useDeleteElectionMutation();

  const handleView = (record: Election) => {
    router.push(`/elections/${record._id}`);
  };

  const handleEdit = (record: Election) => {
    message.info(`Editing election: ${record.election_year}`);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteElection(id).unwrap();
      message.success('Election deleted successfully');
    } catch (error) {
      message.error('Failed to delete election');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'ongoing':
        return 'green';
      case 'completed':
        return 'gray';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Election #',
      dataIndex: 'election',
      key: 'election',
      render: (election: number) => (
        <div>
          <Text strong className="text-gray-900">#{election}</Text>
        </div>
      ),
    },
    {
      title: 'Year',
      dataIndex: 'election_year',
      key: 'election_year',
      render: (year: number) => (
        <div>
          <Text strong className="text-gray-900">{year}</Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} className="capitalize">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Constituencies',
      dataIndex: 'total_constituencies',
      key: 'total_constituencies',
      render: (count: number) => (
        <div className="flex items-center space-x-1">
          <CalendarOutlined className="text-gray-400" />
          <Text className="text-gray-600">{count}</Text>
        </div>
      ),
    },
    {
      title: 'Valid Votes',
      dataIndex: 'total_valid_vote',
      key: 'total_valid_vote',
      render: (count: number) => (
        <div className="flex items-center space-x-1">
          <UserOutlined className="text-gray-400" />
          <Text className="text-gray-600">
            {count ? count.toLocaleString() : 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Total Votes',
      dataIndex: 'total_vote_cast',
      key: 'total_vote_cast',
      render: (count: number) => (
        <div className="flex items-center space-x-1">
          <TeamOutlined className="text-gray-400" />
          <Text className="text-gray-600">
            {count ? count.toLocaleString() : 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Election) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="View"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Edit"
          />
          <Popconfirm
            title="Are you sure you want to delete this election?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <Text type="danger">Failed to load elections data</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2">Elections Management</Title>
          <Text className="text-gray-600">
            Manage and monitor all elections in the system
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          className="election-gradient border-0"
        >
          Create Election
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Elections"
              value={data?.total || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ongoing Elections"
              value={data?.elections?.filter(e => e.status === 'ongoing').length || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Completed Elections"
              value={data?.elections?.filter(e => e.status === 'completed').length || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Elections Table */}
      <Card 
        className="border border-gray-200 shadow-sm"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={data?.elections || []}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} elections`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
          }}
          scroll={{ x: 800 }}
          bordered
          className="election-table"
        />
      </Card>
    </div>
  );
};
