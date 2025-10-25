"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Descriptions, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Tag, 
  Typography, 
  Divider,
  Spin,
  Tabs,
  Button,
  Breadcrumb
} from 'antd';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  TrophyOutlined,
  BarChartOutlined,
  UserOutlined,
  PieChartOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useGetElectionByIdQuery } from '@/features/elections/slices/electionsApiSlice';
import { ElectionCharts } from '@/features/elections/components/ElectionCharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const { Title, Text } = Typography;

export default function ElectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = params.id as string;

  const { data: election, isLoading, error } = useGetElectionByIdQuery(electionId);

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


  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !election) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Text type="danger" className="text-lg">
            Election not found or failed to load
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
              title: `Election #${election.election} - ${election.election_year}`,
            },
          ]}
        />

        {/* Header */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center justify-between gap-4 space-x-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/')}
              className="flex items-center"
            >
              Back
            </Button>
            <div>
              <Title level={3} className="mb-2">
                Election #{election.election} - {election.election_year}
              </Title>
           
            </div>
          </div>
       <div>
          <Button onClick={() => router.push(`/constituencies/${election.election_year}`)}>
            Constituency <ArrowRightOutlined />
          </Button>
       </div>
        </div>

        {/* Content Tabs */}
        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <BarChartOutlined />
                  Overview
                </span>
              ),
              children: (
                <div className="space-y-6">
                  {/* Election Overview */}
                  <Card>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <Statistic
                          title="Election Number"
                          value={election.election}
                          prefix={<TrophyOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Col>
                      <Col xs={24} sm={8}>
                        <Statistic
                          title="Election Year"
                          value={election.election_year}
                          prefix={<CalendarOutlined />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Col>
                      <Col xs={24} sm={8}>
                        <Statistic
                          title="Status"
                          value=" "
                          suffix={
                            <Tag color={getStatusColor(election.status)} className="capitalize ml-2">
                              {election.status}
                            </Tag>
                          }
                        />
                      </Col>
                    </Row>
                  </Card>

                  {/* Election Statistics */}
                  <Card title={
                    <div className="flex items-center space-x-2">
                      <BarChartOutlined className="text-blue-600" />
                      <span>Election Statistics</span>
                    </div>
                  }>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={6}>
                        <Statistic
                          title="Total Constituencies"
                          value={election.total_constituencies}
                          prefix={<TeamOutlined />}
                        />
                      </Col>
                      <Col xs={24} sm={6}>
                        <Statistic
                          title="Valid Votes"
                          value={election.total_valid_vote?.toLocaleString() || 'N/A'}
                          prefix={<UserOutlined />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Col>
                      <Col xs={24} sm={6}>
                        <Statistic
                          title="Cancelled Votes"
                          value={election.cancelled_vote?.toLocaleString() || 'N/A'}
                          prefix={<UserOutlined />}
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Col>
                      <Col xs={24} sm={6}>
                        <Statistic
                          title="Total Votes Cast"
                          value={election.total_vote_cast?.toLocaleString() || 'N/A'}
                          prefix={<TeamOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Col>
                    </Row>

                    <Divider />

                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <Statistic
                          title="Valid Vote %"
                          value={election.percent_valid_vote ? `${election.percent_valid_vote.toFixed(2)}%` : 'N/A'}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Col>
                      <Col xs={24} sm={8}>
                        <Statistic
                          title="Cancelled Vote %"
                          value={election.percent_cancelled_vote ? `${election.percent_cancelled_vote.toFixed(2)}%` : 'N/A'}
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Col>
                      <Col xs={24} sm={8}>
                        <Statistic
                          title="Total Vote Cast %"
                          value={election.percent_total_vote_cast ? `${election.percent_total_vote_cast.toFixed(2)}%` : 'N/A'}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Col>
                    </Row>
                  </Card>
          {/* Participants */}
     
           {election.participant_details && election.participant_details.length > 0 && (
                    <Card title={
                      <div className="flex items-center space-x-2">
                        <TeamOutlined className="text-blue-600" />
                        <span>Participant Details</span>
                      </div>
                    }>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {election.participant_details.map((participant, index) => (
                          <Card key={index} size="small" className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                              <div className="text-center">
                                <Text strong className="text-lg text-gray-900">{participant.party}</Text>
                                <br />
                                <Text className="text-sm text-gray-600">Symbol: {participant.symbol}</Text>
                              </div>
                              
                              <Divider className="my-2" />
                              
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="text-center">
                                  <Text className="text-gray-500">Votes</Text>
                                  <br />
                                  <Text strong className="text-blue-600">
                                    {participant.vote_obtained?.toLocaleString() || 'N/A'}
                                  </Text>
                                </div>
                                <div className="text-center">
                                  <Text className="text-gray-500">Vote %</Text>
                                  <br />
                                  <Text strong className="text-blue-600">
                                    {participant.percent_vote_obtain ? `${participant.percent_vote_obtain.toFixed(2)}%` : 'N/A'}
                                  </Text>
                                </div>
                                <div className="text-center">
                                  <Text className="text-gray-500">Seats</Text>
                                  <br />
                                  <Text strong className="text-green-600">
                                    {participant.seat_obtain || 'N/A'}
                                  </Text>
                                </div>
                                <div className="text-center">
                                  <Text className="text-gray-500">Seat %</Text>
                                  <br />
                                  <Text strong className="text-green-600">
                                    {participant.percent_seat_obtain ? `${participant.percent_seat_obtain.toFixed(2)}%` : 'N/A'}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </Card>
                  )}
                  {/* Election Metadata */}
                  <Card title="Election Information">
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="Election ID">
                        <Text code>{election._id}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Tag color={getStatusColor(election.status)} className="capitalize">
                          {election.status}
                        </Tag>
                      </Descriptions.Item>
                      {election.createdAt && (
                        <Descriptions.Item label="Created At">
                          <Text>{new Date(election.createdAt).toLocaleDateString()}</Text>
                        </Descriptions.Item>
                      )}
                      {election.updatedAt && (
                        <Descriptions.Item label="Last Updated">
                          <Text>{new Date(election.updatedAt).toLocaleDateString()}</Text>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>

              
                </div>
              ),
            },
            {
              key: 'charts',
              label: (
                <span>
                  <PieChartOutlined />
                  Charts & Analytics
                </span>
              ),
              children: <ElectionCharts election={election} />,
            },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
