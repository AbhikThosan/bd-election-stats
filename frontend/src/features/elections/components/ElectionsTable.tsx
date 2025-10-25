import React, { useState } from 'react';
import {
  Button,
  Tag,
  Typography,
  Card,
  Statistic,
  message,
  Popconfirm,
  Pagination,
  Spin
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useGetElectionsQuery, useDeleteElectionMutation, Election } from '@/features/elections/slices/electionsApiSlice';
import { useRouter } from 'next/navigation';
import { ElectionDrawer } from './ElectionDrawer';

const { Title, Text } = Typography;

export const ElectionsTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const router = useRouter();
  
  const { data, isLoading } = useGetElectionsQuery({
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
    } catch {
      message.error('Failed to delete election');
    }
  };

  const handleConstituency = (electionYear: number) => {
    router.push(`/constituencies/${electionYear}`);
  };

  const handleCreateElection = () => {
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
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
          onClick={handleCreateElection}
        >
          Create Election
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <Statistic
            title="Total Elections"
            value={data?.total || 0}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <Statistic
            title="Ongoing Elections"
            value={data?.elections?.filter(e => e.status === 'ongoing').length || 0}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <Statistic
            title="Completed Elections"
            value={data?.elections?.filter(e => e.status === 'completed').length || 0}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#08979c' }}
          />
        </Card>
      </div>

      {/* Elections Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {data?.elections?.map((election) => (
              <Card
                key={election._id}
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow !mt-3"
                bodyStyle={{ padding: '16px' }}
              >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <Title level={4} className="mb-2 text-gray-800">
                      Election #{election.election} - {election.election_year}
                    </Title>
                    <Tag 
                      color={getStatusColor(election.status)} 
                      className="capitalize text-sm px-2 py-1"
                    >
                      {election.status}
                    </Tag>
                  </div>
                    <Button onClick={() => handleConstituency(election.election_year)}>
                      Constituency <ArrowRightOutlined />
                    </Button>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <TeamOutlined className="text-blue-600 text-lg flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-gray-900">
                        {election.total_constituencies}
                      </div>
                      <div className="text-sm text-gray-600">Constituencies</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <UserOutlined className="text-green-600 text-lg flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-gray-900">
                        {election.total_valid_vote?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Valid Votes</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <CalendarOutlined className="text-orange-600 text-lg flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-gray-900">
                        {election.cancelled_vote?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Cancelled</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <TeamOutlined className="text-purple-600 text-lg flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-gray-900">
                        {election.total_vote_cast?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Total Cast</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleView(election)}
                    className="flex-1 sm:flex-none sm:min-w-[120px]"
                    size="middle"
                  >
                    <span className="hidden xs:inline">View Details</span>
                    <span className="xs:hidden">View</span>
                  </Button>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(election)}
                    className="flex-1 sm:flex-none sm:min-w-[100px]"
                    size="middle"
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete Election"
                    description="Are you sure you want to delete this election?"
                    onConfirm={() => handleDelete(election._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      className="flex-1 sm:flex-none sm:min-w-[100px]"
                      size="middle"
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            ))}
            
            {/* Pagination */}
            {data?.total && data.total > pageSize && (
              <div className="flex justify-center mt-6">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={data.total}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} of ${total} elections`
                  }
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size || 10);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Election Drawer */}
      <ElectionDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};
