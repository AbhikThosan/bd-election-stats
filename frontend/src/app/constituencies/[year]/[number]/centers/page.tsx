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
  Popconfirm,
} from "antd";
import {
  CalendarOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  useGetCentersByConstituencyQuery,
  useGetConstituencyByNumberQuery,
  useBulkUploadCentersMutation,
  useDeleteCenterMutation,
  Center,
} from "@/features/constituencies/slices/constituenciesApiSlice";
import toast from "react-hot-toast";
import { CenterDrawer } from "@/features/constituencies/components/CenterDrawer";
import { CenterUploadModal } from "@/features/constituencies/components/CenterUploadModal";
import { CenterBulkUploadStatusModal } from "@/features/constituencies/components/CenterBulkUploadStatus";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GiPlayerBase } from "react-icons/gi";
import { MdOutlineChair } from "react-icons/md";
import { useAuth } from "@/hooks/auth/useAuth";

const { Title, Text } = Typography;
const { Option } = Select;

export default function CentersPage() {
  const params = useParams();
  const router = useRouter();
  const electionYear = parseInt(params.year as string);
  const constituencyNumber = parseInt(params.number as string);
  const { isAuthenticated } = useAuth();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: "center_no" as const,
    order: "asc" as const,
    gender: undefined as "male" | "female" | "both" | undefined,
    min_turnout: undefined as number | undefined,
    max_turnout: undefined as number | undefined,
  });

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);

  const { data, isLoading, error, refetch } = useGetCentersByConstituencyQuery({
    electionYear,
    constituencyNumber,
    ...filters,
  });

  const [bulkUploadCenters] = useBulkUploadCentersMutation();
  const [deleteCenter] = useDeleteCenterMutation();

  const { data: constituencyData } = useGetConstituencyByNumberQuery({
    electionYear,
    constituencyNumber,
  });

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

  const handleGenderChange = (gender: string) => {
    setFilters((prev) => ({
      ...prev,
      gender: gender as "male" | "female" | "both" | undefined,
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

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCreateCenter = () => {
    setEditingCenter(null);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setEditingCenter(null);
  };

  const handleViewDetails = (centerNumber: number) => {
    router.push(
      `/constituencies/${electionYear}/${constituencyNumber}/centers/${centerNumber}`
    );
  };

  const handleEdit = (center: Center) => {
    setEditingCenter(center);
    setDrawerVisible(true);
  };

  const handleDelete = async (id: string, center: Center) => {
    try {
      const constituencyId =
        center.constituency_id ||
        center.constituency_number ||
        constituencyNumber;
      const response = await deleteCenter({
        id,
        electionYear,
        constituencyId,
      }).unwrap();
      toast.success(response.message || "Center deleted successfully", {
        duration: 4000,
        position: "top-center",
      });
    } catch (error: unknown) {
      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };
      const errorMessage = apiError?.data?.message || "Failed to delete center";

      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    }
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
      formData.append("file", file);
      formData.append("election_year", electionYear.toString());
      formData.append("data_type", "center");
      formData.append("overwrite_existing", "false");
      formData.append("validate_only", "false");

      const response = await bulkUploadCenters(formData).unwrap();
      setUploadId(response.upload_id);
      setUploadVisible(false);
    } catch (error) {
      console.error("Upload error:", error);
      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };
      const errorMessage =
        apiError?.data?.message ||
        apiError?.message ||
        "Failed to upload file. Please check your authentication.";

      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
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
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center py-12">
          <Text type="danger" className="text-lg">
            Failed to load centers for constituency #{constituencyNumber}
          </Text>
          <br />
          <Button
            type="primary"
            onClick={() =>
              router.push(
                `/constituencies/${electionYear}/${constituencyNumber}`
              )
            }
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
              onClick: () => router.push(`/constituencies/${electionYear}`),
            },
            {
              title: `Constituency ${constituencyNumber}`,
              onClick: () =>
                router.push(
                  `/constituencies/${electionYear}/${constituencyNumber}`
                ),
            },
            {
              title: "Centers",
            },
          ]}
        />
        <div className="my-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              router.push(
                `/constituencies/${electionYear}/${constituencyNumber}`
              )
            }
            className="flex items-center w-fit"
          >
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Title level={4} className="mb-2">
                <span>
                  Centers -{" "}
                  <span className="hidden md:inline">Constituency</span>{" "}
                  {constituencyNumber} ({constituencyData?.constituency_name}) -{" "}
                  <span className="hidden md:inline">Election</span>{" "}
                  {electionYear}
                </span>
              </Title>
            </div>
          </div>
          {isAuthenticated && (
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
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <div>
              <Text className="text-gray-500 text-sm mb-2 block">
                Total Centers
              </Text>
              <div className="flex items-center gap-2">
                <GiPlayerBase size={32} style={{ color: "#faad14" }} />
                <Text
                  className="text-3xl! font-semibold"
                  style={{ color: "#faad14" }}
                >
                  {data.total}
                </Text>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <p>{`Constituency ${constituencyNumber}`} </p>
            <div className="flex items-center gap-2">
              <MdOutlineChair size={32} style={{ color: "#1890ff" }} />
              <p className="mb-0! text-[#1890ff] text-lg! font-semibold">
                {constituencyData?.constituency_name}{" "}
              </p>
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
              <span>Filters</span>
            </div>
          }
        >
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
          </Row>
        </Card>

        {/* Centers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[400px]">
          {data.centers.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 col-span-full min-h-[400px]">
              <Text type="secondary" className="text-lg">
                No centers found
              </Text>
            </div>
          ) : (
            data.centers.map((center) => (
              <Card
                key={center._id}
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="text-center">
                    <Text strong className="text-lg text-gray-900">
                      Center - {center.center_no}
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
                      <Text strong>
                        {center.total_voters?.toLocaleString() || "N/A"}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-500">Votes Cast:</Text>
                      <Text strong className="text-blue-600">
                        {center.total_votes_cast?.toLocaleString() || "N/A"}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-500">Turnout:</Text>
                      <Text strong className="text-green-600">
                        {center?.turnout_percentage
                          ? `${center.turnout_percentage.toFixed(1)}%`
                          : "N/A"}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-500">Valid Votes:</Text>
                      <Text strong className="text-blue-600">
                        {center.total_valid_votes?.toLocaleString() || "N/A"}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-500">Invalid Votes:</Text>
                      <Text strong className="text-red-600">
                        {center.total_invalid_votes?.toLocaleString() || "N/A"}
                      </Text>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className={`flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 ${
                      isAuthenticated ? "justify-between" : "justify-center"
                    }`}
                  >
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetails(center.center_no)}
                      size="small"
                      title="View Details"
                    />
                    {isAuthenticated && (
                      <>
                        <Button
                          type="default"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(center)}
                          size="small"
                          title="Edit"
                        />
                        <Popconfirm
                          title="Delete Center"
                          description="Are you sure you want to delete this center?"
                          onConfirm={() => handleDelete(center._id, center)}
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

        {/* Center Drawer */}
        <CenterDrawer
          visible={drawerVisible}
          onClose={handleCloseDrawer}
          electionYear={electionYear}
          electionNumber={constituencyData?.election || 1}
          constituencyNumber={constituencyNumber}
          constituencyName={constituencyData?.constituency_name || ""}
          center={editingCenter}
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
