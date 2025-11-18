"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Button,
  Breadcrumb,
  Input,
  Select,
  Space,
  Divider,
  Popconfirm,
} from "antd";
import {
  CalendarOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  HomeOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  useGetConstituenciesByElectionYearQuery,
  useDeleteConstituencyMutation,
  Constituency,
} from "@/features/constituencies/slices/constituenciesApiSlice";
import { useGetElectionsQuery } from "@/features/elections/slices/electionsApiSlice";
import { ConstituencyDrawer } from "@/features/constituencies/components/ConstituencyDrawer";
import { UploadModal } from "@/features/constituencies/components/UploadModal";
import { BulkUploadStatusModal } from "@/features/constituencies/components/BulkUploadStatus";
import { useUploadFile } from "@/features/constituencies/hooks/useUploadFile";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MdOutlineChair } from "react-icons/md";
import { useAuth } from "@/hooks/auth/useAuth";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ConstituenciesPage() {
  const params = useParams();
  const router = useRouter();
  const electionYear = parseInt(params.year as string);
  const { isAuthenticated } = useAuth();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: "",
    sort: "constituency_number" as const,
    order: "asc" as const,
    min_turnout: undefined as number | undefined,
    max_turnout: undefined as number | undefined,
    party: "",
  });

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [editingConstituency, setEditingConstituency] =
    useState<Constituency | null>(null);

  const { data, isLoading, error } = useGetConstituenciesByElectionYearQuery({
    electionYear,
    ...filters,
  });

  // Get election data to find the correct election number
  const { data: electionsData } = useGetElectionsQuery({ page: 1, limit: 100 });
  const currentElection = electionsData?.elections?.find(
    (election) => election.election_year === electionYear
  );

  // Upload hook
  const {
    uploadVisible,
    uploadId,
    handleUploadClick,
    handleUploadClose,
    handleUploadFile,
    setUploadId,
  } = useUploadFile({
    electionYear,
  });

  const [deleteConstituency] = useDeleteConstituencyMutation();

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleSortChange = (sort: string) => {
    setFilters((prev) => ({
      ...prev,
      sort: sort as typeof prev.sort,
      page: 1,
    }));
  };

  const handleOrderChange = (order: string) => {
    setFilters((prev) => ({
      ...prev,
      order: order as typeof prev.order,
      page: 1,
    }));
  };

  const handleTurnoutFilter = (
    type: "min" | "max",
    value: number | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [`${type}_turnout`]: value,
      page: 1,
    }));
  };

  const handlePartyFilter = (party: string) => {
    setFilters((prev) => ({ ...prev, party, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleViewDetails = (constituencyNumber: number) => {
    router.push(`/constituencies/${electionYear}/${constituencyNumber}`);
  };

  const handleEdit = (constituency: Constituency) => {
    setEditingConstituency(constituency);
    setDrawerVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteConstituency(id).unwrap();
      toast.success(response.message || "Constituency deleted successfully", {
        duration: 4000,
        position: "top-center",
      });
    } catch (error: unknown) {
      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };
      const errorMessage =
        apiError?.data?.message || "Failed to delete constituency";

      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    }
  };

  const handleCreateConstituency = () => {
    setEditingConstituency(null);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setEditingConstituency(null);
  };

  const handleCloseStatusModal = () => {
    setStatusModalVisible(false);
    setUploadId(null);
    window.location.reload();
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
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center py-12">
          <Text type="danger" className="text-lg">
            Failed to load constituencies for election year {electionYear}
          </Text>
          <br />
          <Button
            type="primary"
            onClick={() => router.push("/")}
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
      <div className="space-y-6 min-h-[calc(100vh-200px)]">
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
              onClick: () => router.push("/"),
            },
            {
              title: `Election ${electionYear}`,
              onClick: () =>
                router.push(`/elections/${data.constituencies[0]?._id}`),
            },
            {
              title: "Constituencies",
            },
          ]}
        />
        <div className="my-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/")}
            className="flex items-center w-fit"
          >
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Title level={2} className="mb-2 text-lg sm:text-2xl">
                <span className="hidden sm:inline">
                  Constituencies - Election {electionYear}
                </span>
                <span className="sm:hidden">Election {electionYear}</span>
              </Title>
            </div>
          </div>
          {isAuthenticated && (
            <div className="flex justify-end sm:justify-start gap-2">
              <Button icon={<UploadOutlined />} onClick={handleUploadClick}>
                Upload File
              </Button>
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
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <div>
              <Text className="text-gray-500 text-sm mb-2 block">
                Total Constituencies
              </Text>
              <div className="flex items-center gap-2">
                <MdOutlineChair size={32} style={{ color: "#1890ff" }} />
                <Text
                  className="text-3xl! font-semibold"
                  style={{ color: "#1890ff" }}
                >
                  {data.total_constituencies}
                </Text>
              </div>
            </div>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <div>
              <Text className="text-gray-500 text-sm mb-2 block">
                Results Found
              </Text>
              <div className="flex items-center gap-2">
                <BarChartOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                <Text
                  className="text-3xl! font-semibold"
                  style={{ color: "#52c41a" }}
                >
                  {data.total}
                </Text>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <div>
              <Text className="text-gray-500 text-sm mb-2 block">
                Election Year
              </Text>
              <div className="flex items-center gap-2">
                <CalendarOutlined style={{ fontSize: 32, color: "#722ed1" }} />
                <Text
                  className="text-3xl! font-semibold"
                  style={{ color: "#722ed1" }}
                >
                  {data.election_year}
                </Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <FilterOutlined className="text-blue-600" />
              <span>Filters & Search</span>
            </div>
          }
        >
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
                onChange={(e) =>
                  handleTurnoutFilter(
                    "min",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
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
                onChange={(e) =>
                  handleTurnoutFilter(
                    "max",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[400px]">
          {data.constituencies.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 col-span-full min-h-[400px]">
              <Text type="secondary" className="text-lg">
                No constituencies found
              </Text>
            </div>
          ) : (
            data.constituencies.map((constituency) => (
            <Card
              key={constituency._id}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="text-center">
                  <Text strong className="text-lg text-gray-900">
                    Constituency : {constituency.constituency_number} -{" "}
                    {constituency.constituency_name}
                  </Text>
                  <div className="mt-2">
                    <Button
                      type="default"
                      icon={<ArrowRightOutlined />}
                      onClick={() =>
                        router.push(
                          `/constituencies/${electionYear}/${constituency.constituency_number}/centers`
                        )
                      }
                      size="small"
                    >
                      Centers
                    </Button>
                  </div>
                </div>

                <Divider className="my-2" />

                {/* Statistics */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Total Voters:</Text>
                    <Text strong>
                      {constituency.total_voters?.toLocaleString() || "N/A"}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Turnout:</Text>
                    <Text strong className="text-blue-600">
                      {constituency.percent_turnout
                        ? `${constituency.percent_turnout.toFixed(1)}%`
                        : "N/A"}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Centers:</Text>
                    <Text strong>{constituency.total_centers || "N/A"}</Text>
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
                      {constituency.winner.vote?.toLocaleString()} votes (
                      {constituency.winner.percent?.toFixed(1)}%)
                    </Text>

                    {/* Margin */}
                    {constituency.margin_of_victory && (
                      <div>
                        <Text className="text-xs text-gray-500">Margin</Text>{" "}
                        <Text strong className="text-orange-600">
                          {constituency.margin_of_victory.toLocaleString()}{" "}
                          votes
                        </Text>
                        {constituency.margin_percentage && (
                          <Text className="text-xs text-gray-500 ml-1">
                            ({constituency.margin_percentage.toFixed(1)}%)
                          </Text>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className={`flex items-center gap-2 ${isAuthenticated ? 'justify-between' : 'justify-center'}`}>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      handleViewDetails(constituency.constituency_number)
                    }
                    size="small"
                    title="View Details"
                  />
                  {isAuthenticated && (
                    <>
                      <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(constituency)}
                        size="small"
                        title="Edit"
                      />
                      <Popconfirm
                        title="Delete Constituency"
                        description="Are you sure you want to delete this constituency?"
                        onConfirm={() => handleDelete(constituency._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="default"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          title="Delete"
                        />
                      </Popconfirm>
                    </>
                  )}
                </div>
              </div>
            </Card>
            ))
          )}
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

        {/* Upload Modal */}
        <UploadModal
          visible={uploadVisible}
          onClose={handleUploadClose}
          onUpload={handleUploadFile}
        />

        {/* Bulk Upload Status Modal */}
        {uploadId && (
          <BulkUploadStatusModal
            visible={statusModalVisible}
            uploadId={uploadId}
            onClose={handleCloseStatusModal}
          />
        )}

        {/* Constituency Drawer */}
        <ConstituencyDrawer
          visible={drawerVisible}
          onClose={handleCloseDrawer}
          electionYear={electionYear}
          electionNumber={
            currentElection?.election || data?.constituencies[0]?.election || 1
          }
          constituency={editingConstituency}
        />
      </div>
    </DashboardLayout>
  );
}
