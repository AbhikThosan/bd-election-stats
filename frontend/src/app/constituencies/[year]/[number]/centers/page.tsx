"use client";

import React, { useState, useEffect } from 'react';
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
  Space
} from 'antd';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  TrophyOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { 
  useGetCentersByConstituencyQuery, 
  useGetConstituencyByNumberQuery,
  useBulkUploadCentersMutation 
} from '@/features/constituencies/slices/constituenciesApiSlice';
import Swal from 'sweetalert2';
import { CenterDrawer } from '@/features/constituencies/components/CenterDrawer';
import { CenterUploadModal } from '@/features/constituencies/components/CenterUploadModal';
import { CenterBulkUploadStatusModal } from '@/features/constituencies/components/CenterBulkUploadStatus';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CentersPage() {
  const params = useParams();
  const router = useRouter();
  const electionYear = parseInt(params.year as string);
  const constituencyNumber = parseInt(params.number as string);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: 'center_no' as const,
    order: 'asc' as const,
    gender: undefined as 'male' | 'female' | 'both' | undefined,
    min_turnout: undefined as number | undefined,
    max_turnout: undefined as number | undefined,
  });

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useGetCentersByConstituencyQuery({
    electionYear,
    constituencyNumber,
    ...filters,
  });

  const [bulkUploadCenters] = useBulkUploadCentersMutation();

  const { data: constituencyData } = useGetConstituencyByNumberQuery({
    electionYear,
    constituencyNumber,
  });

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort: sort as typeof prev.sort, page: 1 }));
  };

  const handleOrderChange = (order: string) => {
    setFilters(prev => ({ ...prev, order: order as typeof prev.order, page: 1 }));
  };

  const handleGenderChange = (gender: string) => {
    setFilters(prev => ({ ...prev, gender: gender as 'male' | 'female' | 'both' | undefined, page: 1 }));
  };

  const handleTurnoutFilter = (type: 'min' | 'max', value: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [`${type}_turnout`]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateCenter = () => {
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleViewDetails = (centerNumber: number) => {
    router.push(`/constituencies/${electionYear}/${constituencyNumber}/centers/${centerNumber}`);
  };

  const handleEdit = (centerNumber: number) => {
    // TODO: Implement edit functionality
    console.log('Edit center:', centerNumber);
  };

  const handleDelete = (centerNumber: number) => {
    // TODO: Implement delete functionality
    console.log('Delete center:', centerNumber);
  };

  const handleUploadClick = () => {
    setUploadVisible(true);
  };

  const handleUploadClose = () => {
    setUploadVisible(false);
  };

  const handleUploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('election_year', electionYear.toString());
      formData.append('data_type', 'center');
      formData.append('overwrite_existing', 'false');
      formData.append('validate_only', 'false');

      const response = await bulkUploadCenters(formData).unwrap();
      setUploadId(response.upload_id);
      setUploadVisible(false);
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload file. Please check your authentication.',
      });
    }
  };

  const handleCloseStatusModal = () => {
    setStatusModalVisible(false);
    setUploadId(null);
    // Refetch centers list
    refetch();
  };

  // Open status modal when uploadId is set
  useEffect(() => {
    if (uploadId && !statusModalVisible) {
      setStatusModalVisible(true);
    }
  }, [uploadId, statusModalVisible]);

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
            Failed to load centers for constituency #{constituencyNumber}
          </Text>
          <br />
          <Button 
            type="primary" 
            onClick={() => router.push(`/constituencies/${electionYear}/${constituencyNumber}`)}
            className="mt-4"
          >
            Back to Constituency
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
              onClick: () => router.push(`/constituencies/${electionYear}`),
            },
            {
              title: `Constituency #${constituencyNumber}`,
              onClick: () => router.push(`/constituencies/${electionYear}/${constituencyNumber}`),
            },
            {
              title: 'Centers',
            },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push(`/constituencies/${electionYear}/${constituencyNumber}`)}
              className="flex items-center w-fit"
            >
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex-1">
              <Title level={2} className="mb-2 text-lg sm:text-2xl">
                <span className="hidden sm:inline">Centers - Constituency #{constituencyNumber} - Election {electionYear}</span>
                <span className="sm:hidden">Centers</span>
              </Title>
              <Text className="text-gray-600 text-sm sm:text-base">
                <span className="hidden sm:inline">Total Centers: {data.total_centers} • {data.total} results</span>
                <span className="sm:hidden">{data.total_centers} centers</span>
              </Text>
            </div>
          </div>
          <div className="flex justify-end sm:justify-start gap-2">
            <Button 
              icon={<UploadOutlined />}
              onClick={handleUploadClick}
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Upload File</span>
              <span className="sm:hidden">Upload</span>
            </Button>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateCenter}
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Create Center</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Total Centers"
              value={data.total_centers}
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
            <span>Filters</span>
          </div>
        }>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Sort by"
                value={filters.sort}
                onChange={handleSortChange}
                className="w-full"
              >
                <Option value="center_no">Center #</Option>
                <Option value="center_name">Center Name</Option>
                <Option value="turnout">Turnout</Option>
                <Option value="total_voters">Total Voters</Option>
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
              <Select
                placeholder="Gender"
                value={filters.gender}
                onChange={handleGenderChange}
                allowClear
                className="w-full"
              >
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="both">Both</Option>
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
          </Row>
        </Card>

        {/* Centers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.centers.map((center) => (
            <Card
              key={center._id}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              bodyStyle={{ padding: '16px' }}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="text-center">
                  <Text strong className="text-lg text-gray-900">
                    Center #{center.center_no}
                  </Text>
                  <br />
                  <Text className="text-sm text-gray-600">
                    {center.center} 
                  </Text>
                </div>

                <div className="border-t border-gray-200 my-2" />

                {/* Statistics */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Total Voters:</Text>
                    <Text strong>{center.total_voters?.toLocaleString() || 'N/A'}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Votes Cast:</Text>
                    <Text strong className="text-blue-600">
                      {center.total_votes_cast?.toLocaleString() || 'N/A'}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Turnout:</Text>
                    <Text strong className="text-green-600">
                      {center?.turnout_percentage ? `${center.turnout_percentage.toFixed(1)}%` : 'N/A'}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Valid Votes:</Text>
                    <Text strong className="text-blue-600">
                      {center.total_valid_votes?.toLocaleString() || 'N/A'}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Invalid Votes:</Text>
                    <Text strong className="text-red-600">
                      {center.total_invalid_votes?.toLocaleString() || 'N/A'}
                    </Text>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200">
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(center.center_no)}
                    size="small"
                    title="View Details"
                  />
                  <Button
                    type="default"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(center.center_no)}
                    size="small"
                    title="Edit"
                  />
                  <Button
                    type="default"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(center.center_no)}
                    size="small"
                    title="Delete"
                  />
                </div>
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

        {/* Center Drawer */}
        <CenterDrawer
          visible={drawerVisible}
          onClose={handleCloseDrawer}
          electionYear={electionYear}
          electionNumber={constituencyData?.election || 1}
          constituencyNumber={constituencyNumber}
          constituencyName={constituencyData?.constituency_name || ''}
        />

        {/* Upload Modal */}
        <CenterUploadModal
          visible={uploadVisible}
          onClose={handleUploadClose}
          onUpload={handleUploadFile}
        />

        {/* Bulk Upload Status Modal */}
        {uploadId && (
          <CenterBulkUploadStatusModal
            visible={statusModalVisible}
            uploadId={uploadId}
            onClose={handleCloseStatusModal}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

