import React from 'react';
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Row,
  Col,
  Divider,
  Card,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useCreateConstituencyMutation, CreateConstituencyData, ConstituencyParticipant } from '@/features/constituencies/slices/constituenciesApiSlice';

const { Title, Text } = Typography;

interface ConstituencyDrawerProps {
  visible: boolean;
  onClose: () => void;
  electionYear: number;
  electionNumber: number;
}

interface ConstituencyFormData {
  election: number;
  election_year: number;
  constituency_number: number;
  constituency_name: string;
  total_voters: number;
  total_centers: number;
  reported_centers?: number;
  suspended_centers: number;
  total_valid_votes: number;
  cancelled_votes: number;
  total_turnout: number;
  percent_turnout: number;
  participant_details: ConstituencyParticipant[];
}

export const ConstituencyDrawer: React.FC<ConstituencyDrawerProps> = ({
  visible,
  onClose,
  electionYear,
  electionNumber,
}) => {
  const [form] = Form.useForm();
  const [createConstituency, { isLoading }] = useCreateConstituencyMutation();

  const handleSubmit = async (values: ConstituencyFormData) => {
    try {
      // Ensure participant_details is provided with at least 2 candidates
      const formData = {
        ...values,
        election: electionNumber,
        election_year: electionYear,
        participant_details: values.participant_details || [
          {
            candidate: 'Sample Candidate 1',
            party: 'Sample Party 1',
            symbol: 'Sample Symbol 1',
            vote: 0,
            percent: 0,
          },
          {
            candidate: 'Sample Candidate 2',
            party: 'Sample Party 2',
            symbol: 'Sample Symbol 2',
            vote: 0,
            percent: 0,
          },
        ],
      };

      await createConstituency(formData).unwrap();
      message.success('Constituency created successfully!');
      form.resetFields();
      onClose();
    } catch (error: unknown) {
      console.error('Create constituency error:', error);
      
      // Show error in sweet alert
      const errorMessage = (error as { data?: { message?: string }; message?: string })?.data?.message || 
                          (error as { data?: { message?: string }; message?: string })?.message || 
                          'Failed to create constituency. Please check your authentication.';
      
      // Check if it's an authentication error
      if (errorMessage.includes('Invalid token') || errorMessage.includes('No token')) {
        Swal.fire({
          icon: 'warning',
          title: 'Authentication Required',
          text: 'Your session has expired. Please log in again to create constituencies.',
          confirmButtonText: 'Go to Login',
          confirmButtonColor: '#dc2626',
          showCloseButton: true,
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
            htmlContainer: 'swal-content',
            confirmButton: 'swal-confirm-button'
          }
        }).then(() => {
          // Redirect to login
          window.location.href = '/login';
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Constituency Creation Failed',
          text: errorMessage,
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc2626',
          showCloseButton: true,
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
            htmlContainer: 'swal-content',
            confirmButton: 'swal-confirm-button'
          }
        });
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <>
      <style jsx global>{`
        .swal-popup {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .swal-title {
          font-size: 20px;
          font-weight: 600;
          color: #dc2626;
        }
        .swal-content {
          font-size: 16px;
          color: #374151;
          line-height: 1.5;
        }
        .swal-confirm-button {
          background-color: #dc2626 !important;
          border-radius: 6px !important;
          font-weight: 500 !important;
          padding: 8px 24px !important;
        }
        .swal-confirm-button:hover {
          background-color: #b91c1c !important;
        }
      `}</style>
      <Drawer
        title={
          <div className="flex items-center space-x-2">
            <PlusOutlined className="text-blue-600" />
            <span className="hidden sm:inline">Create New Constituency</span>
            <span className="sm:hidden">Create Constituency</span>
          </div>
        }
        placement="right"
        open={visible}
        onClose={handleCancel}
        width={800}
        className="sm:!w-[800px] lg:!w-[900px]"
        footer={
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button onClick={handleCancel} icon={<CloseOutlined />} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={isLoading}
              icon={<SaveOutlined />}
              className="w-full sm:w-auto"
            >
              Create Constituency
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{
            election: electionNumber,
            election_year: electionYear,
            suspended_centers: 0,
            participant_details: [
              {
                candidate: 'Sample Candidate 1',
                party: 'Sample Party 1',
                symbol: 'Sample Symbol 1',
                vote: 0,
                percent: 0,
              },
              {
                candidate: 'Sample Candidate 2',
                party: 'Sample Party 2',
                symbol: 'Sample Symbol 2',
                vote: 0,
                percent: 0,
              },
            ],
          }}
        >
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h3>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                       <Form.Item
                         label="Election Number"
                         name="election"
                         rules={[
                           { required: true, message: 'Please enter election number' },
                           { type: 'number', min: 1, message: 'Election number must be positive' },
                         ]}
                       >
                         <InputNumber
                           placeholder={`e.g., ${electionNumber}`}
                           className="w-full"
                           min={1}
                           disabled
                         />
                       </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Election Year"
                  name="election_year"
                  rules={[
                    { required: true, message: 'Please enter election year' },
                    { type: 'number', min: 1970, max: 2030, message: 'Year must be between 1970-2030' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 1996"
                    className="w-full"
                    min={1970}
                    max={2030}
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Constituency Number"
                  name="constituency_number"
                  rules={[
                    { required: true, message: 'Please enter constituency number' },
                    { type: 'number', min: 1, message: 'Constituency number must be positive' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 201"
                    className="w-full"
                    min={1}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Constituency Name"
                  name="constituency_name"
                  rules={[
                    { required: true, message: 'Please enter constituency name' },
                    { min: 2, message: 'Constituency name must be at least 2 characters' },
                  ]}
                >
                  <Input
                    placeholder="e.g., Narsingdi-5"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Voter Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Voter Statistics
            </h3>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Total Voters"
                  name="total_voters"
                  rules={[
                    { required: true, message: 'Please enter total voters' },
                    { type: 'number', min: 1, message: 'Must be positive number' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 219827"
                    className="w-full"
                    min={1}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Total Centers"
                  name="total_centers"
                  rules={[
                    { required: true, message: 'Please enter total centers' },
                    { type: 'number', min: 1, message: 'Must be positive number' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 123"
                    className="w-full"
                    min={1}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Reported Centers"
                  name="reported_centers"
                  rules={[
                    { type: 'number', min: 0, message: 'Must be non-negative' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 123"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Suspended Centers"
                  name="suspended_centers"
                  rules={[
                    { required: true, message: 'Please enter suspended centers' },
                    { type: 'number', min: 0, message: 'Must be non-negative' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 0"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Total Turnout"
                  name="total_turnout"
                  rules={[
                    { required: true, message: 'Please enter total turnout' },
                    { type: 'number', min: 0, message: 'Must be non-negative' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 170283"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Turnout Percentage"
                  name="percent_turnout"
                  rules={[
                    { required: true, message: 'Please enter turnout percentage' },
                    { type: 'number', min: 0, max: 100, message: 'Must be 0-100%' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 77.46"
                    className="w-full"
                    min={0}
                    max={100}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Vote Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Vote Statistics
            </h3>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Total Valid Votes"
                  name="total_valid_votes"
                  rules={[
                    { required: true, message: 'Please enter total valid votes' },
                    { type: 'number', min: 0, message: 'Must be non-negative' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 168198"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Cancelled Votes"
                  name="cancelled_votes"
                  rules={[
                    { required: true, message: 'Please enter cancelled votes' },
                    { type: 'number', min: 0, message: 'Must be non-negative' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 2085"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Participant Details */}
          <div className="mb-6">
            <Title level={4} className="text-lg font-semibold text-gray-800 mb-4">
              Participant Details (Required)
            </Title>
            <Text type="secondary" className="block mb-4">
              Add at least 2 candidates participating in this constituency.
            </Text>
            
            <Form.List
              name="participant_details"
              rules={[
                {
                  validator: async (_, participants) => {
                    if (!participants || participants.length < 2) {
                      return Promise.reject(new Error('At least 2 candidates are required'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" className="mb-4">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'candidate']}
                            label="Candidate Name"
                            rules={[{ required: true, message: 'Candidate name is required' }]}
                          >
                            <Input placeholder="e.g., A.K.M. Shahidul Islam" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'party']}
                            label="Party"
                            rules={[{ required: true, message: 'Party is required' }]}
                          >
                            <Input placeholder="e.g., Ganatantri Party" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'symbol']}
                            label="Symbol"
                            rules={[{ required: true, message: 'Symbol is required' }]}
                          >
                            <Input placeholder="e.g., Paira" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'vote']}
                            label="Votes"
                            rules={[{ type: 'number', min: 0, message: 'Must be non-negative' }]}
                          >
                            <InputNumber placeholder="0" className="w-full" min={0} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={3}>
                          <Form.Item
                            {...restField}
                            name={[name, 'percent']}
                            label="Percent"
                            rules={[{ type: 'number', min: 0, max: 100, message: 'Must be 0-100%' }]}
                          >
                            <InputNumber placeholder="0" className="w-full" min={0} max={100} step={0.01} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={1}>
                          <Form.Item label=" " className="mb-0">
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                              disabled={fields.length <= 2}
                              className="w-full sm:w-auto"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  
                  <Form.ErrorList errors={errors} />
                  
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="w-full"
                  >
                    Add Candidate
                  </Button>
                </>
              )}
            </Form.List>
          </div>

          <Divider />

          {/* Form Actions */}
          <div className="text-center text-gray-500 text-sm">
            <p className="hidden sm:block">All fields marked with basic information are required.</p>
            <p className="hidden sm:block">Vote statistics and participant details can be added later or updated after creation.</p>
            <p className="sm:hidden">Fill all required fields to create constituency.</p>
          </div>
        </Form>
      </Drawer>
    </>
  );
};
