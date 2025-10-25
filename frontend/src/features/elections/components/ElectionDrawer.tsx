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
import { useCreateElectionMutation } from '@/features/elections/slices/electionsApiSlice';

const { Option } = Select;
const { Title, Text } = Typography;

interface ElectionDrawerProps {
  visible: boolean;
  onClose: () => void;
}

interface ParticipantDetail {
  party: string;
  symbol: string;
  vote_obtained: number;
  percent_vote_obtain: number;
  seat_obtain: number;
  percent_seat_obtain: number;
}

interface ElectionFormData {
  election: number;
  election_year: number;
  total_constituencies: number;
  status: 'scheduled' | 'ongoing' | 'completed';
  total_valid_vote?: number;
  cancelled_vote?: number;
  total_vote_cast?: number;
  percent_valid_vote?: number;
  percent_cancelled_vote?: number;
  percent_total_vote_cast?: number;
  participant_details: ParticipantDetail[];
}

export const ElectionDrawer: React.FC<ElectionDrawerProps> = ({
  visible,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [createElection, { isLoading }] = useCreateElectionMutation();

  const handleSubmit = async (values: ElectionFormData) => {
    try {
      // Ensure participant_details is provided with at least 2 parties
      const formData = {
        ...values,
        participant_details: values.participant_details || [
          {
            party: 'Awami League',
            symbol: 'Boat',
            vote_obtained: 0,
            percent_vote_obtain: 0,
            seat_obtain: 0,
            percent_seat_obtain: 0,
          },
          {
            party: 'BNP',
            symbol: 'Paddy Sheaf',
            vote_obtained: 0,
            percent_vote_obtain: 0,
            seat_obtain: 0,
            percent_seat_obtain: 0,
          },
        ],
      };

      await createElection(formData).unwrap();
      message.success('Election created successfully!');
      form.resetFields();
      onClose();
    } catch (error: unknown) {
      console.error('Create election error:', error);
      
      // Show error in sweet alert
      const errorMessage = (error as { data?: { message?: string }; message?: string })?.data?.message || 
                          (error as { data?: { message?: string }; message?: string })?.message || 
                          'Failed to create election. Please check your authentication.';
      
      Swal.fire({
        icon: 'error',
        title: 'Election Creation Failed',
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
            <span>Create New Election</span>
          </div>
        }
        open={visible}
        onClose={handleCancel}
        width={720}
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
              Create Election
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
          status: 'scheduled',
          participant_details: [
            {
              party: 'Awami League',
              symbol: 'Boat',
              vote_obtained: 0,
              percent_vote_obtain: 0,
              seat_obtain: 0,
              percent_seat_obtain: 0,
            },
            {
              party: 'BNP',
              symbol: 'Paddy Sheaf',
              vote_obtained: 0,
              percent_vote_obtain: 0,
              seat_obtain: 0,
              percent_seat_obtain: 0,
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
            <Col span={12}>
              <Form.Item
                label="Election Number"
                name="election"
                rules={[
                  { required: true, message: 'Please enter election number' },
                  { type: 'number', min: 1, message: 'Election number must be positive' },
                ]}
              >
                <InputNumber
                  placeholder="e.g., 8"
                  className="w-full"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Election Year"
                name="election_year"
                rules={[
                  { required: true, message: 'Please enter election year' },
                  { type: 'number', min: 1970, max: 2030, message: 'Year must be between 1970-2030' },
                ]}
              >
                <InputNumber
                  placeholder="e.g., 2024"
                  className="w-full"
                  min={1970}
                  max={2030}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Total Constituencies"
                name="total_constituencies"
                rules={[
                  { required: true, message: 'Please enter total constituencies' },
                  { type: 'number', min: 1, message: 'Must be positive number' },
                ]}
              >
                <InputNumber
                  placeholder="e.g., 300"
                  className="w-full"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="scheduled">Scheduled</Option>
                  <Option value="ongoing">Ongoing</Option>
                  <Option value="completed">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Vote Statistics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Vote Statistics (Optional)
          </h3>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Valid Votes"
                name="total_valid_vote"
                rules={[
                  { type: 'number', min: 0, message: 'Must be non-negative' },
                ]}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Cancelled Votes"
                name="cancelled_vote"
                rules={[
                  { type: 'number', min: 0, message: 'Must be non-negative' },
                ]}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Total Votes Cast"
                name="total_vote_cast"
                rules={[
                  { type: 'number', min: 0, message: 'Must be non-negative' },
                ]}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Valid Vote %"
                name="percent_valid_vote"
                rules={[
                  { type: 'number', min: 0, max: 100, message: 'Must be 0-100%' },
                ]}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full"
                  min={0}
                  max={100}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Cancelled Vote %"
                name="percent_cancelled_vote"
                rules={[
                  { type: 'number', min: 0, max: 100, message: 'Must be 0-100%' },
                ]}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full"
                  min={0}
                  max={100}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Total Vote Cast %"
                name="percent_total_vote_cast"
                rules={[
                  { type: 'number', min: 0, max: 100, message: 'Must be 0-100%' },
                ]}
              >
                <InputNumber
                  placeholder="0"
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

        {/* Participant Details */}
        <div className="mb-6">
          <Title level={4} className="text-lg font-semibold text-gray-800 mb-4">
            Participant Details (Required)
          </Title>
          <Text type="secondary" className="block mb-4">
            Add at least 2 political parties participating in this election.
          </Text>
          
          <Form.List
            name="participant_details"
            rules={[
              {
                validator: async (_, participants) => {
                  if (!participants || participants.length < 2) {
                    return Promise.reject(new Error('At least 2 parties are required'));
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
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'party']}
                          label="Party Name"
                          rules={[{ required: true, message: 'Party name is required' }]}
                        >
                          <Input placeholder="e.g., Awami League" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'symbol']}
                          label="Symbol"
                          rules={[{ required: true, message: 'Symbol is required' }]}
                        >
                          <Input placeholder="e.g., Boat" />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, 'vote_obtained']}
                          label="Votes"
                          rules={[{ type: 'number', min: 0, message: 'Must be non-negative' }]}
                        >
                          <InputNumber placeholder="0" className="w-full" min={0} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, 'percent_vote_obtain']}
                          label="Vote %"
                          rules={[{ type: 'number', min: 0, max: 100, message: 'Must be 0-100%' }]}
                        >
                          <InputNumber placeholder="0" className="w-full" min={0} max={100} step={0.01} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, 'seat_obtain']}
                          label="Seats"
                          rules={[{ type: 'number', min: 0, message: 'Must be non-negative' }]}
                        >
                          <InputNumber placeholder="0" className="w-full" min={0} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, 'percent_seat_obtain']}
                          label="Seat %"
                          rules={[{ type: 'number', min: 0, max: 100, message: 'Must be 0-100%' }]}
                        >
                          <InputNumber placeholder="0" className="w-full" min={0} max={100} step={0.01} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item label=" " className="mb-0">
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            disabled={fields.length <= 2}
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
                  Add Party
                </Button>
              </>
            )}
          </Form.List>
        </div>

        <Divider />

        {/* Form Actions */}
        <div className="text-center text-gray-500 text-sm">
          <p>All fields marked with basic information are required.</p>
          <p>Vote statistics and participant details can be added later or updated after creation.</p>
        </div>
      </Form>
    </Drawer>
    </>
  );
};
