import React, { useState } from "react";
import {
  Button,
  Tag,
  Typography,
  Card,
  Popconfirm,
  Pagination,
  Spin,
} from "antd";
import toast from "react-hot-toast";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  useGetElectionsQuery,
  useDeleteElectionMutation,
  Election,
  DeleteElectionErrorResponse,
} from "@/features/elections/slices/electionsApiSlice";
import { ApiErrorResponse } from "@/types/api";
import { useRouter } from "next/navigation";
import { ElectionDrawer } from "./ElectionDrawer";
import { TbSum } from "react-icons/tb";
import { AiOutlineFileDone } from "react-icons/ai";
import { FaHourglassStart } from "react-icons/fa";
import { MdOutlineChair } from "react-icons/md";

const { Title, Text } = Typography;

export const ElectionsTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const router = useRouter();

  const { data, isLoading } = useGetElectionsQuery({
    page: currentPage,
    limit: pageSize,
  });

  const [deleteElection] = useDeleteElectionMutation();

  const handleView = (record: Election) => {
    router.push(`/elections/${record._id}`);
  };

  const handleEdit = (record: Election) => {
    setEditingElection(record);
    setDrawerVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteElection(id).unwrap();
      toast.success(response.message || "Election deleted successfully", {
        duration: 4000,
        position: "top-center",
      });
    } catch (error: unknown) {
      // Handle error response with constituency results count
      const apiError = error as ApiErrorResponse & {
        data?: DeleteElectionErrorResponse;
      };
      const errorMessage =
        apiError?.data?.message || "Failed to delete election";
      const constituencyResultsCount = apiError?.data?.constituencyResultsCount;

      let fullErrorMessage = errorMessage;
      if (constituencyResultsCount !== undefined) {
        fullErrorMessage = `${errorMessage} (${constituencyResultsCount} constituency result${
          constituencyResultsCount !== 1 ? "s" : ""
        } exist)`;
      }

      toast.error(fullErrorMessage, {
        duration: 5000,
        position: "top-center",
      });
    }
  };

  const handleConstituency = (electionYear: number) => {
    router.push(`/constituencies/${electionYear}`);
  };

  const handleCreateElection = () => {
    setEditingElection(null);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setEditingElection(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "blue";
      case "ongoing":
        return "green";
      case "completed":
        return "gray";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2">
            BD National Parliment Election Data
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreateElection}
        >
          Create Election
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <div>
            <Text className="text-gray-500 text-sm mb-2 block">
              Total Elections
            </Text>
            <div className="flex items-center gap-2">
              <TbSum size={32} style={{ color: "#3f8600" }} />
              <Text
                className="text-3xl! font-semibold"
                style={{ color: "#3f8600" }}
              >
                {data?.total || 0}
              </Text>
            </div>
          </div>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <div>
            <Text className="text-gray-500 text-sm mb-2 block">
              Completed Elections
            </Text>
            <div className="flex items-center gap-2">
              <AiOutlineFileDone size={32} style={{ color: "#08979c" }} />
              <Text
                className="text-3xl! font-semibold"
                style={{ color: "#08979c" }}
              >
                {data?.elections?.filter((e) => e.status === "completed")
                  .length || 0}
              </Text>
            </div>
          </div>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <div>
            <Text className="text-gray-500 text-sm mb-2 block">
              Ongoing Elections
            </Text>
            <div className="flex items-center gap-2">
              <FaHourglassStart size={32} style={{ color: "#cf1322" }} />
              <Text
                className="text-3xl! font-semibold"
                style={{ color: "#cf1322" }}
              >
                {data?.elections?.filter((e) => e.status === "ongoing")
                  .length || 0}
              </Text>
            </div>
          </div>
        </Card>
      </div>

      {/* Elections Cards */}
      <Title level={3} className="py-4">
        All Elections
      </Title>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="flex justify-center py-8 col-span-full">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {data?.elections?.map((election) => (
              <Card
                key={election._id}
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <Title level={4} className="mb-2 text-gray-800">
                      Election : {election.election} - Year :{" "}
                      {election.election_year}
                    </Title>
                    <Tag
                      color={getStatusColor(election.status)}
                      className="capitalize text-sm px-2 py-1"
                    >
                      {election.status}
                    </Tag>
                  </div>
                  <Button
                    onClick={() => handleConstituency(election.election_year)}
                  >
                    <MdOutlineChair size={20} />
                    Constituencies
                    <ArrowRightOutlined />
                  </Button>
                </div>

                {/* Statistics Grid */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <MdOutlineChair
                      size={32}
                      className="text-blue-600 text-lg shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-gray-900">
                        {election.total_constituencies}
                      </div>
                      <div className="text-sm text-gray-600">
                        Constituencies
                      </div>
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
              <div className="flex justify-center mt-6 col-span-full">
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
        election={editingElection}
      />
    </div>
  );
};
