"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Spin,
  Button,
  Breadcrumb,
} from "antd";
import {
  TrophyOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  ArrowRightOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  useGetConstituencyByNumberQuery,
  Constituency,
} from "@/features/constituencies/slices/constituenciesApiSlice";
import { ConstituencyDrawer } from "@/features/constituencies/components/ConstituencyDrawer";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AiOutlineNumber } from "react-icons/ai";
import { useAuth } from "@/hooks/auth/useAuth";
import { GiPlayerBase, GiTabletopPlayers, GiVote } from "react-icons/gi";
import { HiReceiptPercent } from "react-icons/hi2";
import { LiaUsersSolid, LiaVoteYeaSolid } from "react-icons/lia";
import { MdOutlineCancelPresentation } from "react-icons/md";

const { Title, Text } = Typography;

export default function ConstituencyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const electionYear = parseInt(params.year as string);
  const constituencyNumber = parseInt(params.number as string);
  const { isAuthenticated } = useAuth();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingConstituency, setEditingConstituency] =
    useState<Constituency | null>(null);

  const {
    data: constituency,
    isLoading,
    error,
  } = useGetConstituencyByNumberQuery({
    electionYear,
    constituencyNumber,
  });

  const handleEdit = () => {
    if (constituency) {
      setEditingConstituency(constituency);
      setDrawerVisible(true);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setEditingConstituency(null);
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

  if (error || !constituency) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Text type="danger" className="text-lg">
            Failed to load constituency details
          </Text>
          <br />
          <Button
            type="primary"
            onClick={() => router.push(`/constituencies/${electionYear}`)}
            className="mt-4"
          >
            Back to Constituencies
          </Button>
        </div>
      </DashboardLayout>
    );
  }

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
              onClick: () => router.push("/"),
            },
            {
              title: `Election ${electionYear}`,
              onClick: () => router.push(`/constituencies/${electionYear}`),
            },
            {
              title: `Constituency ${constituencyNumber}`,
            },
          ]}
        />

        <div className="my-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/constituencies/${electionYear}`)}
            className="flex items-center w-fit"
          >
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
        {/* Header */}
        <div>
          <Title level={2} className="mb-2 text-lg sm:text-2xl"></Title>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Title level={4} className="mb-2 ">
                <span>
                  <span className="hidden md:inline">Election </span>
                  {electionYear} -
                </span>
                <span>
                  <span className="hidden md:inline">Constituency </span>
                  {constituencyNumber} - {constituency.constituency_name}
                </span>
              </Title>
            </div>
          </div>
          <div className="flex justify-end sm:justify-start gap-2">
            {isAuthenticated && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className="w-full sm:w-auto"
              >
                <span className="hidden sm:inline">Edit Constituency</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            )}
            <Button
              icon={<ArrowRightOutlined />}
              onClick={() =>
                router.push(
                  `/constituencies/${electionYear}/${constituencyNumber}/centers`
                )
              }
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Centers</span>
              <span className="sm:hidden">Centers</span>
            </Button>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <div>
              <Text className="text-gray-500 text-sm mb-2 block">
                Constituency Number
              </Text>
              <div className="flex items-center gap-2">
                <AiOutlineNumber size={32} style={{ color: "#1890ff" }} />
                <Text
                  className="text-3xl! font-semibold"
                  style={{ color: "#1890ff" }}
                >
                  {constituency.constituency_number}
                </Text>
              </div>
            </div>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <div>
              <Text className="text-gray-500 text-sm mb-2 block">
                Total Voters
              </Text>
              <div className="flex items-center gap-2">
                <LiaUsersSolid size={32} style={{ color: "#3bd0eb" }} />
                <Text
                  className="text-3xl! font-semibold"
                  style={{ color: "#3bd0eb" }}
                >
                  {constituency.total_voters}
                </Text>
              </div>
            </div>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <div>
              <Text className="text-gray-500 text-sm mb-2 block">Turnout</Text>
              <div className="flex items-center gap-2">
                <HiReceiptPercent size={32} style={{ color: "#722ed1" }} />
                <Text
                  className="text-3xl! font-semibold"
                  style={{ color: "#722ed1" }}
                >
                  {constituency.percent_turnout}%
                </Text>
              </div>
            </div>
          </Card>
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
                  {constituency.total_centers}
                </Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Vote Statistics */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <BarChartOutlined className="text-blue-600" />
              <span>Vote Statistics</span>
            </div>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text className="text-gray-500 text-sm mb-2 block">
                  Total Valid Votes
                </Text>
                <div className="flex items-center gap-2">
                  <LiaVoteYeaSolid size={32} style={{ color: "#52c41a" }} />
                  <Text
                    className="text-3xl! font-semibold"
                    style={{ color: "#52c41a" }}
                  >
                    {constituency.total_valid_votes}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text className="text-gray-500 text-sm mb-2 block">
                  Cancelled Votes
                </Text>
                <div className="flex items-center gap-2">
                  <MdOutlineCancelPresentation
                    size={32}
                    style={{ color: "#fa1414" }}
                  />
                  <Text
                    className="text-3xl! font-semibold"
                    style={{ color: "#fa1414" }}
                  >
                    {constituency.cancelled_votes}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text className="text-gray-500 text-sm mb-2 block">
                  Total Turnout
                </Text>
                <div className="flex items-center gap-2">
                  <GiVote size={32} style={{ color: "#1890ff" }} />
                  <Text
                    className="text-3xl! font-semibold"
                    style={{ color: "#1890ff" }}
                  >
                    {constituency.total_turnout}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text className="text-gray-500 text-sm mb-2 block">
                  Suspended Centers
                </Text>
                <div className="flex items-center gap-2">
                  <GiPlayerBase size={32} style={{ color: "#f5222d" }} />
                  <Text
                    className="text-3xl! font-semibold"
                    style={{ color: "#f5222d" }}
                  >
                    {constituency.suspended_centers}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Participant Details */}
        {constituency.participant_details &&
          constituency.participant_details.length > 0 && (
            <Card
              title={
                <div className="flex items-center space-x-2">
                  <GiTabletopPlayers size={36} className="text-blue-600" />
                  <span>Participants</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {constituency.participant_details.map((participant, index) => (
                  <Card
                    key={index}
                    size="small"
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="text-center">
                        <Text strong className="text-lg text-gray-900">
                          {participant.candidate}
                        </Text>
                        <br />
                        <Text className="text-sm text-gray-600">
                          {participant.party}
                        </Text>
                        <br />
                        <Text className="text-xs text-gray-500">
                          Symbol: {participant.symbol}
                        </Text>
                      </div>

                      <Divider className="my-2" />

                      {/* Statistics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <Text className="text-xs text-gray-500">Votes</Text>
                          <br />
                          <Text strong className="text-blue-600">
                            {participant.vote.toLocaleString()}
                          </Text>
                        </div>
                        <div className="text-center">
                          <Text className="text-xs text-gray-500">Vote %</Text>
                          <br />
                          <Text strong className="text-blue-600">
                            {participant.percent.toFixed(2)}%
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

        {/* Winner Information */}
        {constituency.winner && (
          <Card className="bg-green-50">
            <div className="space-y-4">
              <Title level={4} className="flex items-center space-x-2">
                <TrophyOutlined className="text-green-600" />
                <span>Winner</span>
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div>
                    <Text type="secondary">Candidate</Text>
                    <br />
                    <Title level={5}>{constituency.winner.candidate}</Title>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text type="secondary">Party</Text>
                    <br />
                    <Text strong>{constituency.winner.party}</Text>
                    <br />
                    <Text type="secondary">
                      Symbol: {constituency.winner.symbol}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text type="secondary">Votes</Text>
                    <br />
                    <Text strong className="text-green-600 text-lg">
                      {constituency.winner.vote.toLocaleString()}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text type="secondary">Vote Percentage</Text>
                    <br />
                    <Text strong className="text-green-600 text-lg">
                      {constituency.winner.percent.toFixed(2)}%
                    </Text>
                  </div>
                </Col>
              </Row>

              {/* Margin of Victory */}
              {constituency.margin_of_victory && (
                <div className="mt-4">
                  <Divider />
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text className="text-gray-500 text-sm mb-2 block">
                          Margin of Victory
                        </Text>
                        <div className="flex items-center">
                          <Text
                            className="text-3xl! font-semibold"
                            style={{ color: "#faad14" }}
                          >
                            {constituency.margin_of_victory.toLocaleString()}{" "}
                            votes
                          </Text>
                        </div>
                      </div>
                    </Col>
                    {constituency.margin_percentage && (
                      <Col xs={24} sm={12}>
                        <div>
                          <Text className="text-gray-500 text-sm mb-2 block">
                            Margin Percentage
                          </Text>
                          <div className="flex items-center">
                            <Text
                              className="text-3xl! font-semibold"
                              style={{ color: "#faad14" }}
                            >
                              {constituency.margin_percentage}%
                            </Text>
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Constituency Drawer */}
        <ConstituencyDrawer
          visible={drawerVisible}
          onClose={handleCloseDrawer}
          electionYear={electionYear}
          electionNumber={constituency?.election || 1}
          constituency={editingConstituency}
        />
      </div>
    </DashboardLayout>
  );
}
