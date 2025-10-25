"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Spin,
  Button,
  Breadcrumb,
  Input,
  Select,
  Space,
  Divider
} from 'antd';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  TrophyOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useGetConstituenciesByElectionYearQuery } from '@/features/constituencies/slices/constituenciesApiSlice';
import { useGetElectionsQuery } from '@/features/elections/slices/electionsApiSlice';
import { ConstituencyDrawer } from '@/features/constituencies/components/ConstituencyDrawer';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ConstituenciesPage() {
  const params = useParams();
  const router = useRouter();
  const electionYear = parseInt(params.year as string);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    sort: 'constituency_number' as const,
    order: 'asc' as const,
    min_turnout: undefined as number | undefined,
    max_turnout: undefined as number | undefined,
    party: '',
  });

  const [drawerVisible, setDrawerVisible] = useState(false);

  const { data, isLoading, error } = useGetConstituenciesByElectionYearQuery({
    electionYear,
    ...filters,
  });

  // Get election data to find the correct election number
  const { data: electionsData } = useGetElectionsQuery({ page: 1, limit: 100 });
  const currentElection = electionsData?.elections?.find(election => election.election_year === electionYear);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort: sort as typeof prev.sort, page: 1 }));
  };

  const handleOrderChange = (order: string) => {
    setFilters(prev => ({ ...prev, order: order as typeof prev.order, page: 1 }));
  };

  const handleTurnoutFilter = (type: 'min' | 'max', value: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [`${type}_turnout`]: value,
      page: 1,
    }));
  };

  const handlePartyFilter = (party: string) => {
    setFilters(prev => ({ ...prev, party, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewDetails = (constituencyNumber: number) => {
    router.push(`/constituencies/${electionYear}/${constituencyNumber}`);
  };

  const handleCreateConstituency = () => {
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Text type="danger" className="text-lg">
            Failed to load constituencies for election year {electionYear}
          </Text>
          <br />
          <Button 
            type="primary" 
            onClick={() => router.push('/')}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalPages = Math.ceil(data.total / filters.limit);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            {
              title: (
                <span className="flex items-center">
                  <HomeOutlined />
                  <span className="ml-1">Dashboard</span>
                </span>
              ),
              onClick: () => router.push('/'),
            },
            {
              title: `Election ${electionYear}`,
              onClick: () => router.push(`/elections/${data.constituencies[0]?._id}`),
            },
            {
              title: 'Constituencies',
            },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/')}
              className="flex items-center w-fit"
            >
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex-1">
              <Title level={2} className="mb-2 text-lg sm:text-2xl">
                <span className="hidden sm:inline">Constituencies - Election {electionYear}</span>
                <span className="sm:hidden">Election {electionYear}</span>
              </Title>
              <Text className="text-gray-600 text-sm sm:text-base">
                <span className="hidden sm:inline">{data.total_constituencies} constituencies • {data.total} total results</span>
                <span className="sm:hidden">{data.total_constituencies} constituencies</span>
              </Text>
            </div>
          </div>
          <div className="flex justify-end sm:justify-start">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateConstituency}
              className="w-full sm:w-auto"
              size="middle"
            >
              <span className="hidden sm:inline">Create Constituency</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Total Constituencies"
              value={data.total_constituencies}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Results Found"
              value={data.total}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Current Page"
              value={`${data.page} of ${totalPages}`}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Election Year"
              value={data.election_year}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </div>

        {/* Filters */}
        <Card title={
          <div className="flex items-center space-x-2">
            <FilterOutlined className="text-blue-600" />
            <span>Filters & Search</span>
          </div>
        }>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search constituencies..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Sort by"
                value={filters.sort}
                onChange={handleSortChange}
                className="w-full"
              >
                <Option value="constituency_number">Number</Option>
                <Option value="constituency_name">Name</Option>
                <Option value="percent_turnout">Turnout %</Option>
                <Option value="total_voters">Total Voters</Option>
                <Option value="margin_of_victory">Margin</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Select
                placeholder="Order"
                value={filters.order}
                onChange={handleOrderChange}
                className="w-full"
              >
                <Option value="asc">Ascending</Option>
                <Option value="desc">Descending</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Input
                placeholder="Min Turnout %"
                type="number"
                min={0}
                max={100}
                value={filters.min_turnout}
                onChange={(e) => handleTurnoutFilter('min', e.target.value ? parseFloat(e.target.value) : undefined)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Input
                placeholder="Max Turnout %"
                type="number"
                min={0}
                max={100}
                value={filters.max_turnout}
                onChange={(e) => handleTurnoutFilter('max', e.target.value ? parseFloat(e.target.value) : undefined)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Input
                placeholder="Party Filter"
                value={filters.party}
                onChange={(e) => handlePartyFilter(e.target.value)}
                allowClear
              />
            </Col>
          </Row>
        </Card>

        {/* Constituencies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.constituencies.map((constituency) => (
            <Card
              key={constituency._id}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              bodyStyle={{ padding: '16px' }}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="text-center">
                  <Text strong className="text-lg text-gray-900">
                    #{constituency.constituency_number}
                  </Text>
                  <br />
                  <Text className="text-sm text-gray-600">
                    {constituency.constituency_name}
                  </Text>
                </div>

                <Divider className="my-2" />

                {/* Statistics */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Total Voters:</Text>
                    <Text strong>{constituency.total_voters?.toLocaleString() || 'N/A'}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Turnout:</Text>
                    <Text strong className="text-blue-600">
                      {constituency.percent_turnout ? `${constituency.percent_turnout.toFixed(1)}%` : 'N/A'}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Centers:</Text>
                    <Text strong>{constituency.total_centers || 'N/A'}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Candidates:</Text>
                    <Text strong>{constituency.total_candidates || 'N/A'}</Text>
                  </div>
                </div>

                {/* Winner */}
                {constituency.winner && (
                  <div className="mt-3 p-2 bg-green-50 rounded">
                    <Text className="text-xs text-gray-500">Winner</Text>
                    <br />
                    <Text strong className="text-green-700">
                      {constituency.winner.candidate}
                    </Text>
                    <br />
                    <Text className="text-xs text-gray-600">
                      {constituency.winner.party} ({constituency.winner.symbol})
                    </Text>
                    <br />
                    <Text className="text-xs text-green-600">
                      {constituency.winner.vote?.toLocaleString()} votes ({constituency.winner.percent?.toFixed(1)}%)
                    </Text>
                  </div>
                )}

                {/* Margin */}
                {constituency.margin_of_victory && (
                  <div className="text-center">
                    <Text className="text-xs text-gray-500">Margin</Text>
                    <br />
                    <Text strong className="text-orange-600">
                      {constituency.margin_of_victory.toLocaleString()} votes
                    </Text>
                    {constituency.margin_percentage && (
                      <Text className="text-xs text-gray-500 ml-1">
                        ({constituency.margin_percentage.toFixed(1)}%)
                      </Text>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetails(constituency.constituency_number)}
                  className="w-full mt-3"
                  size="small"
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Space>
              <Button
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-gray-600">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next
              </Button>
            </Space>
          </div>
        )}

        {/* Constituency Drawer */}
        <ConstituencyDrawer
          visible={drawerVisible}
          onClose={handleCloseDrawer}
          electionYear={electionYear}
          electionNumber={currentElection?.election || data?.constituencies[0]?.election || 1}
        />
      </div>
    </DashboardLayout>
  );
}
