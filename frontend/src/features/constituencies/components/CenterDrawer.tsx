import React from 'react';
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
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
import { useCreateCenterMutation, CreateCenterData, ParticipantInfo } from '@/features/constituencies/slices/constituenciesApiSlice';

const { Option } = Select;
const { Title, Text } = Typography;

interface CenterDrawerProps {
  visible: boolean;
  onClose: () => void;
  electionYear: number;
  electionNumber: number;
  constituencyNumber: number;
  constituencyName: string;
}

export const CenterDrawer: React.FC<CenterDrawerProps> = ({
  visible,
  onClose,
  electionYear,
  electionNumber,
  constituencyNumber,
  constituencyName,
}) => {
  const [form] = Form.useForm();
  const [createCenter, { isLoading }] = useCreateCenterMutation();

  const handleSubmit = async (values: CreateCenterData) => {
    try {
      const formData = {
        ...values,
        election: electionNumber,
        election_year: electionYear,
        constituency_id: constituencyNumber,
        constituency_name: constituencyName,
        participant_info: values.participant_info || [],
      };

      await createCenter(formData).unwrap();
      message.success('Center created successfully!');
      form.resetFields();
      onClose();
      window.location.reload();
    } catch (error: unknown) {
      console.error('Create center error:', error);
      
      const errorMessage = (error as { data?: { message?: string }; message?: string })?.data?.message || 
                          (error as { data?: { message?: string }; message?: string })?.message || 
                          'Failed to create center. Please check your authentication.';
      
      if (errorMessage.includes('Invalid token') || errorMessage.includes('No token')) {
        Swal.fire({
          icon: 'warning',
          title: 'Authentication Required',
          text: 'Your session has expired. Please log in again to create centers.',
          confirmButtonText: 'Go to Login',
          confirmButtonColor: '#dc2626',
          showCloseButton: true,
        }).then(() => {
          window.location.href = '/login';
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Center Creation Failed',
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
            <span>Create New Center</span>
          </div>
        }
        open={visible}
        onClose={handleCancel}
        width={800}
        footer={
          <div className="flex justify-end space-x-2">
            <Button onClick={handleCancel} icon={<CloseOutlined />}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={isLoading}
              icon={<SaveOutlined />}
            >
              Create Center
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
            constituency_id: constituencyNumber,
            constituency_name: constituencyName,
            gender: 'both',
            co_ordinate: {
              lat: 0,
              lon: 0,
            },
            participant_info: [
              {
                name: '',
                symbol: '',
                vote: 0,
              },
            ],
          }}
        >
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h3>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Election Number"
                  name="election"
                  rules={[
                    { required: true, message: 'Please enter election number' },
                    { type: 'number', min: 1, message: 'Election number must be positive' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 7"
                    className="w-full"
                    min={1}
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
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
              <Col span={8}>
                <Form.Item
                  label="Constituency Number"
                  name="constituency_id"
                  rules={[
                    { required: true, message: 'Please enter constituency number' },
                    { type: 'number', min: 1, message: 'Constituency number must be positive' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 203"
                    className="w-full"
                    min={1}
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Constituency Name"
                  name="constituency_name"
                  rules={[{ required: true, message: 'Please enter constituency name' }]}
                >
                  <Input placeholder="e.g., নরসিংদী-৫" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Center Number"
                  name="center_no"
                  rules={[
                    { required: true, message: 'Please enter center number' },
                    { type: 'number', min: 1, message: 'Center number must be positive' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 1"
                    className="w-full"
                    min={1}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Center Name"
                  name="center"
                  rules={[{ required: true, message: 'Please enter center name' }]}
                >
                  <Input placeholder="e.g., বিয়াম ল্যাবরেটরী স্কুল" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Gender"
                  name="gender"
                  rules={[{ required: true, message: 'Please select gender' }]}
                >
                  <Select placeholder="Select gender">
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                    <Option value="both">Both</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Total Voters"
                  name="total_voters"
                  rules={[
                    { required: true, message: 'Please enter total voters' },
                    { type: 'number', min: 1, message: 'Must be positive number' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 1459"
                    className="w-full"
                    min={1}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Coordinate Information (Optional) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Coordinate Information (Optional)
            </h3>

             <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Latitude"
                  name={['co_ordinate', 'lat']}
                  rules={[
                    { type: 'number', min: -90, max: 90, message: 'Latitude must be between -90 and 90' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 23.976380"
                    className="w-full"
                    step={0.000001}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Longitude"
                  name={['co_ordinate', 'lon']}
                  rules={[
                    { type: 'number', min: -180, max: 180, message: 'Longitude must be between -180 and 180' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 90.653956"
                    className="w-full"
                    step={0.000001}
                  />
                </Form.Item>
              </Col>
            </Row> 

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Map Link"
                  name="map_link"
                  rules={[
                    { type: 'url', message: 'Please enter a valid URL' },
                  ]}
                >
                  <Input placeholder="http://google.com/maps/..." />
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

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Valid Votes"
                  name="total_valid_votes"
                  rules={[
                    { required: true, message: 'Please enter total valid votes' },
                    { type: 'number', min: 0, message: 'Must be non-negative' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 626"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Invalid Votes"
                  name="total_invalid_votes"
                  rules={[
                    { required: true, message: 'Please enter total invalid votes' },
                    { type: 'number', min: 0, message: 'Must be non-negative' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 11"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Total Votes Cast"
                  name="total_votes_cast"
                  rules={[
                    { required: true, message: 'Please enter total votes cast' },
                    { type: 'number', min: 0, message: 'Must be non-negative' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 637"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Turnout Percentage"
                  name="turnout_percentage"
                  rules={[
                    { required: true, message: 'Please enter turnout percentage' },
                    { type: 'number', min: 0, max: 100, message: 'Must be 0-100%' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 43.66"
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

          {/* Participant Information */}
          <div className="mb-6">
            <Title level={4} className="text-lg font-semibold text-gray-800 mb-4">
              Participant Information (Required)
            </Title>
            <Text type="secondary" className="block mb-4">
              Add at least 1 participant for this center.
            </Text>

            <Form.List
              name="participant_info"
              rules={[
                {
                  validator: async (_, participants) => {
                    if (!participants || participants.length < 1) {
                      return Promise.reject(new Error('At least 1 participant is required'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" className="mb-4">
                      <Row gutter={16}>
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            label="Participant Name"
                            rules={[{ required: true, message: 'Participant name is required' }]}
                          >
                            <Input placeholder="e.g., আলহাজ মুফতি আব্দুল কাদের মোল্লা" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'symbol']}
                            label="Symbol"
                            rules={[{ required: true, message: 'Symbol is required' }]}
                          >
                            <Input placeholder="e.g., মিনার" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'vote']}
                            label="Votes"
                            rules={[{ type: 'number', min: 0, message: 'Must be non-negative' }]}
                          >
                            <InputNumber
                              placeholder="0"
                              className="w-full"
                              min={0}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={1}>
                          <Form.Item label=" " className="mb-0">
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                              disabled={fields.length <= 1}
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
                    Add Participant
                  </Button>
                </>
              )}
            </Form.List>
          </div>

          <Divider />

          {/* Form Actions */}
          <div className="text-center text-gray-500 text-sm">
            <p>All fields marked with basic information are required.</p>
            <p>Coordinate and participant information can be added or updated after creation.</p>
          </div>
        </Form>
      </Drawer>
    </>
  );
};

