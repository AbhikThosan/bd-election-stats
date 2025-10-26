"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Descriptions, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Spin,
  Button,
  Breadcrumb,
  Divider,
  Tag
} from 'antd';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  TrophyOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useGetCenterByNumberQuery } from '@/features/constituencies/slices/constituenciesApiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const { Title, Text } = Typography;

export default function CenterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const electionYear = parseInt(params.year as string);
  const constituencyNumber = parseInt(params.number as string);
  const centerNumber = parseInt(params.centerNo as string);

  const { data: center, isLoading, error } = useGetCenterByNumberQuery({
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
            onClick={() => router.push(`/constituencies/${electionYear}/${constituencyNumber}/centers`)}
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
              onClick: () => router.push(`/constituencies/${electionYear}/${constituencyNumber}/centers`),
            },
            {
              title: `Center #${centerNumber}`,
            },
          ]}
        />

        {/* Header */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center justify-between gap-4 space-x-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push(`/constituencies/${electionYear}/${constituencyNumber}/centers`)}
              className="flex items-center"
            >
              Back
            </Button>
            <div>
              <Title level={3} className="mb-2">
                Center #{center.center_no} - {center.center}
              </Title>
              <Text type="secondary">
                {center.constituency_name} • Election {electionYear}
              </Text>
            </div>
          </div>
        </div>

        {/* Overview Statistics */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Statistic
                title="Center Number"
                value={center.center_no}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Election Year"
                value={center.election_year}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Election Number"
                value={center.election}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Gender Category"
                value={center.gender}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Vote Statistics */}
        <Card title={
          <div className="flex items-center space-x-2">
            <BarChartOutlined className="text-blue-600" />
            <span>Vote Statistics</span>
          </div>
        }>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Total Voters"
                value={center.total_voters?.toLocaleString() || 'N/A'}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Votes Cast"
                value={center.total_votes_cast?.toLocaleString() || 'N/A'}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Turnout"
                value={center.turnout_percentage ? `${center.turnout_percentage.toFixed(2)}%` : 'N/A'}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Valid Votes"
                value={center.total_valid_votes?.toLocaleString() || 'N/A'}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Invalid Votes"
                value={center.total_invalid_votes?.toLocaleString() || 'N/A'}
                valueStyle={{ color: '#f5222d' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Cancelled Votes"
                value={(center.total_invalid_votes || 0).toLocaleString() || '0'}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Participant Information */}
        {center.participant_info && center.participant_info.length > 0 && (
          <Card title={
            <div className="flex items-center space-x-2">
              <TeamOutlined className="text-blue-600" />
              <span>Participant Information</span>
            </div>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {center.participant_info.map((participant, index) => (
                <Card key={index} size="small" className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="text-center">
                      <Text strong className="text-lg text-gray-900">{participant.name}</Text>
                      <br />
                      <Tag color="blue">{participant.symbol}</Tag>
                    </div>
                    <Divider className="my-2" />
                    <div className="text-center">
                      <Text className="text-gray-500">Votes:</Text>
                      <br />
                      <Text strong className="text-blue-600 text-lg">
                        {participant.vote?.toLocaleString() || 'N/A'}
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Center Details */}
        <Card title="Center Information">
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
              <Tag color="purple" className="capitalize">{center.gender}</Tag>
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
                <a href={center.map_link} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  <EnvironmentOutlined /> Open in Maps
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Map */}
        {center.map_link && (
          <Card title={
            <div className="flex items-center space-x-2">
              <EnvironmentOutlined className="text-blue-600" />
              <span>Location Map</span>
            </div>
          }>
            <div className="w-full h-96 border border-gray-200 rounded">
              <iframe
                src={center.map_link}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

