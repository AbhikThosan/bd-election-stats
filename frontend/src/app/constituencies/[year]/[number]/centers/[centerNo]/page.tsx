"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Descriptions,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Button,
  Breadcrumb,
  Divider,
  Tag,
} from "antd";
import {
  CalendarOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useGetCenterByNumberQuery } from "@/features/constituencies/slices/constituenciesApiSlice";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GiPlayerBase, GiTabletopPlayers, GiVote } from "react-icons/gi";
import { MdOutlineCancelPresentation, MdOutlineChair } from "react-icons/md";
import { LiaUsersSolid, LiaVoteYeaSolid } from "react-icons/lia";
import { BiFemale, BiMale, BiMaleFemale } from "react-icons/bi";
import { HiReceiptPercent } from "react-icons/hi2";

const { Title, Text } = Typography;

export default function CenterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const electionYear = parseInt(params.year as string);
  const constituencyNumber = parseInt(params.number as string);
  const centerNumber = parseInt(params.centerNo as string);

  const {
    data: center,
    isLoading,
    error,
  } = useGetCenterByNumberQuery({
    electionYear,
    constituencyNumber,
    centerNumber,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !center) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Text type="danger" className="text-lg">
            Center not found or failed to load
          </Text>
          <br />
          <Button
            type="primary"
            onClick={() =>
              router.push(
                `/constituencies/${electionYear}/${constituencyNumber}/centers`
              )
            }
            className="mt-4"
          >
            Back to Centers
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
              onClick: () =>
                router.push(
                  `/constituencies/${electionYear}/${constituencyNumber}`
                ),
            },
            {
              title: "Centers",
              onClick: () =>
                router.push(
                  `/constituencies/${electionYear}/${constituencyNumber}/centers`
                ),
            },
            {
              title: `Center ${centerNumber}`,
            },
          ]}
        />
        <div className="my-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              router.push(
                `/constituencies/${electionYear}/${constituencyNumber}/centers`
              )
            }
            className="flex items-center"
          >
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center justify-between gap-4 space-x-4">
            <div>
              <Title level={4} className="mb-2">
                <span className="hidden md:inline">Constituency</span>{" "}
                {constituencyNumber} - {center.constituency_name} -{" "}
                <span className="hidden md:inline">Election</span>{" "}
                {electionYear}
              </Title>

              <Title level={4} className="mb-2">
                <span className="hidden md:inline">
                  Center {center.center_no} -
                </span>{" "}
                {center.center}{" "}
                {center.map_link && (
                  <a
                    href={center.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm ring-1 ring-blue-600 rounded-md px-2! py-1! ml-2 inline-flex items-center"
                  >
                    <EnvironmentOutlined className="mr-1" /> Open in Maps
                  </a>
                )}
              </Title>
            </div>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <Text className="text-gray-500 text-sm mb-2 block">
              Center {center.center_no}
            </Text>
            <div>
              <div className="text-md! font-semibold text-[#318019]! inline-flex items-center gap-2">
                <GiPlayerBase size={32} style={{ color: "#318019" }} />
                {center.center}
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <Text className="text-gray-500 text-sm mb-2 block">
              Constituency {constituencyNumber}
            </Text>
            <div className="flex items-center gap-2">
              <MdOutlineChair size={32} style={{ color: "#1890ff" }} />
              <Text className="mb-0! text-[#1890ff]! text-lg! font-semibold">
                {center.constituency_name}
              </Text>
            </div>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <div>
              <Text className="text-gray-500 text-sm mb-2 block">
                Election Year
              </Text>
              <div className="flex items-center gap-2">
                <CalendarOutlined style={{ fontSize: 32, color: "#722ed1" }} />
                <Text className="text-xl! font-semibold text-[#722ed1]!">
                  {electionYear}
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
            <Col xs={24} sm={8}>
              <div>
                <Text className="text-gray-500 text-sm mb-2 block">Gender</Text>
                <div className="flex items-center gap-2">
                  {center.gender === "female" && (
                    <BiFemale size={32} style={{ color: "#05e0b1" }} />
                  )}
                  {center.gender === "male" && (
                    <BiMale size={32} style={{ color: "#05e0b1" }} />
                  )}
                  {center.gender === "both" && (
                    <BiMaleFemale size={32} style={{ color: "#05e0b1" }} />
                  )}
                  <Text
                    className="text-3xl! font-semibold capitalize"
                    style={{ color: "#05e0b1" }}
                  >
                    {center.gender}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
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
                    {center.total_voters}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div>
                <Text className="text-gray-500 text-sm mb-2 block">
                  Turnout
                </Text>
                <div className="flex items-center gap-2">
                  <HiReceiptPercent size={32} style={{ color: "#722ed1" }} />
                  <Text
                    className="text-3xl! font-semibold"
                    style={{ color: "#722ed1" }}
                  >
                    {center.turnout_percentage} %
                  </Text>
                </div>
              </div>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <div>
                <Text className="text-gray-500 text-sm mb-2 block">
                  Total Votes Cast
                </Text>
                <div className="flex items-center gap-2">
                  <GiVote size={32} style={{ color: "#1890ff" }} />
                  <Text
                    className="text-3xl! font-semibold"
                    style={{ color: "#1890ff" }}
                  >
                    {center.total_votes_cast}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div>
                <Text className="text-gray-500 text-sm mb-2 block">
                  Valid Votes
                </Text>
                <div className="flex items-center gap-2">
                  <LiaVoteYeaSolid size={32} style={{ color: "#52c41a" }} />
                  <Text
                    className="text-3xl! font-semibold"
                    style={{ color: "#52c41a" }}
                  >
                    {center.total_valid_votes}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div>
                <Text className="text-gray-500 text-sm mb-2 block">
                  Invalid Votes
                </Text>
                <div className="flex items-center gap-2">
                  <MdOutlineCancelPresentation
                    size={32}
                    style={{ color: "#f5222d" }}
                  />
                  <Text
                    className="text-3xl! font-semibold"
                    style={{ color: "#f5222d" }}
                  >
                    {center.total_invalid_votes}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Participant Information */}
        {center.participant_info && center.participant_info.length > 0 && (
          <Card
            title={
              <div className="flex items-center space-x-2">
                <GiTabletopPlayers size={36} className="text-blue-600" />
                <span>Participants</span>
              </div>
            }
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {center.participant_info.map((participant, index) => (
                <Card
                  key={index}
                  size="small"
                  className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="text-center">
                      <Text strong className="text-lg text-gray-900">
                        {participant.name}
                      </Text>
                      <br />
                      <Tag color="blue">{participant.symbol}</Tag>
                    </div>
                    <Divider className="my-0!" />
                    <div className="text-center">
                      <Text className="text-gray-500">Votes:</Text>
                      <br />
                      <Text strong className="text-blue-600 text-lg!">
                        {participant.vote?.toLocaleString() || "N/A"}
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Center Details */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <GiPlayerBase size={36} className="text-blue-600" />
              <span>Center Information</span>
            </div>
          }
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Center Name">
              <Text>{center.center}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Constituency">
              <Text>{center.constituency_name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Constituency Number">
              <Text>{center.constituency_number}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Gender Category">
              <Tag color="purple" className="capitalize">
                {center.gender}
              </Tag>
            </Descriptions.Item>
            {center.co_ordinate && (
              <>
                <Descriptions.Item label="Latitude">
                  <Text>{center.co_ordinate.lat}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Longitude">
                  <Text>{center.co_ordinate.lon}</Text>
                </Descriptions.Item>
              </>
            )}
            {center.map_link && (
              <Descriptions.Item label="Map Link" span={2}>
                <a
                  href={center.map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  <EnvironmentOutlined /> Open in Maps
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Map */}
        {(center.map_link || center.co_ordinate) && (
          <Card
            title={
              <div className="flex items-center space-x-2">
                <EnvironmentOutlined className="text-blue-600" />
                <span>Location Map</span>
              </div>
            }
          >
            <div className="w-full h-96 border border-gray-200 rounded">
              {(() => {
                // Check if map_link is already an embed URL
                const isEmbedUrl = center.map_link?.includes("/embed");

                // If coordinates are available, use them to generate embed URL
                if (center.co_ordinate?.lat && center.co_ordinate?.lon) {
                  const embedUrl = `https://www.google.com/maps?q=${center.co_ordinate.lat},${center.co_ordinate.lon}&output=embed`;
                  return (
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  );
                }

                // If map_link is already an embed URL, use it directly
                if (isEmbedUrl && center.map_link) {
                  return (
                    <iframe
                      src={center.map_link}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  );
                }

                // Fallback: show message with link to open in new tab
                return (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <EnvironmentOutlined className="text-4xl text-gray-400 mb-4" />
                    <Text className="text-gray-600 mb-4">
                      Map cannot be embedded. Click the link below to view in
                      Google Maps.
                    </Text>
                    {center.map_link && (
                      <a
                        href={center.map_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Open in Google Maps
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
