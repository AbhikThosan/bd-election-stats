"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Divider,
  Spin,
  Button,
  Breadcrumb
} from 'antd';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  TrophyOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useGetConstituencyByNumberQuery } from '@/features/constituencies/slices/constituenciesApiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const { Title, Text } = Typography;

export default function ConstituencyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const electionYear = parseInt(params.year as string);
  const constituencyNumber = parseInt(params.number as string);

  const { data: constituency, isLoading, error } = useGetConstituencyByNumberQuery({
    electionYear,
    constituencyNumber,
  });

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit constituency:', constituencyNumber);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete constituency:', constituencyNumber);
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
              onClick: () => router.push('/'),
            },
            {
              title: `Election ${electionYear}`,
              onClick: () => router.push(`/constituencies/${electionYear}`),
            },
            {
              title: `Constituency #${constituencyNumber}`,
            },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push(`/constituencies/${electionYear}`)}
              className="flex items-center w-fit"
            >
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex-1">
              <Title level={2} className="mb-2 text-lg sm:text-2xl">
                <span className="hidden sm:inline">Constituency #{constituencyNumber} - {constituency.constituency_name}</span>
                <span className="sm:hidden">Constituency #{constituencyNumber}</span>
              </Title>
              <Text className="text-gray-600 text-sm sm:text-base">
                <span className="hidden sm:inline">{constituency.constituency_name} • Election {electionYear}</span>
                <span className="sm:hidden">{constituency.constituency_name}</span>
              </Text>
            </div>
          </div>
            <div className="flex justify-end sm:justify-start gap-2">
              <Button 
                icon={<ArrowRightOutlined />}
                onClick={() => router.push(`/constituencies/${electionYear}/${constituencyNumber}/centers`)}
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
            <Statistic
              title="Constituency Number"
              value={constituency.constituency_number}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Total Voters"
              value={constituency.total_voters}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Turnout"
              value={constituency.percent_turnout}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Total Centers"
              value={constituency.total_centers}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </div>

        {/* Vote Statistics */}
        <Card title={
          <div className="flex items-center space-x-2">
            <BarChartOutlined className="text-blue-600" />
            <span>Vote Statistics</span>
          </div>
        }>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Total Valid Votes"
                value={constituency.total_valid_votes}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Cancelled Votes"
                value={constituency.cancelled_votes}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Total Turnout"
                value={constituency.total_turnout}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Suspended Centers"
                value={constituency.suspended_centers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Participant Details */}
        {constituency.participant_details && constituency.participant_details.length > 0 && (
          <Card title={
            <div className="flex items-center space-x-2">
              <TeamOutlined className="text-blue-600" />
              <span>Participant Details</span>
            </div>
          }>
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
                      <Text strong className="text-lg text-gray-900">{participant.candidate}</Text>
                      <br />
                      <Text className="text-sm text-gray-600">{participant.party}</Text>
                      <br />
                      <Text className="text-xs text-gray-500">Symbol: {participant.symbol}</Text>
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
                    <Text type="secondary">Symbol: {constituency.winner.symbol}</Text>
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
                      <Statistic
                        title="Margin of Victory"
                        value={constituency.margin_of_victory.toLocaleString()}
                        suffix="votes"
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    {constituency.margin_percentage && (
                      <Col xs={24} sm={12}>
                        <Statistic
                          title="Margin Percentage"
                          value={constituency.margin_percentage}
                          suffix="%"
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

