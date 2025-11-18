import React, { useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Divider,
  Card,
  Typography,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import toast from 'react-hot-toast';
import {
  useCreateCenterMutation,
  useUpdateCenterMutation,
  useGetCenterByNumberQuery,
  CreateCenterData,
  ParticipantInfo,
  Center,
} from '@/features/constituencies/slices/constituenciesApiSlice';

const { Option } = Select;
const { Title, Text } = Typography;

interface CenterDrawerProps {
  visible: boolean;
  onClose: () => void;
  electionYear: number;
  electionNumber: number;
  constituencyNumber: number;
  constituencyName: string;
  center?: Center | null;
}

export const CenterDrawer: React.FC<CenterDrawerProps> = ({
  visible,
  onClose,
  electionYear,
  electionNumber,
  constituencyNumber,
  constituencyName,
  center,
}) => {
  const [form] = Form.useForm();
  const [createCenter, { isLoading: isCreating }] = useCreateCenterMutation();
  const [updateCenter, { isLoading: isUpdating }] = useUpdateCenterMutation();

  const isEditMode = !!center;
  const isLoading = isCreating || isUpdating;

  // Fetch full center data when editing
  const { data: fullCenterData, isLoading: isLoadingCenter } =
    useGetCenterByNumberQuery(
      {
        electionYear: electionYear,
        constituencyNumber: constituencyNumber,
        centerNumber: center?.center_no || 0,
      },
      {
        skip: !isEditMode || !center || !visible,
      }
    );

  // Prefill form when editing with fetched data or when creating
  useEffect(() => {
    if (visible && isEditMode && fullCenterData) {
      form.setFieldsValue({
        election: fullCenterData.election,
        election_year: fullCenterData.election_year,
        constituency_id: fullCenterData.constituency_id || fullCenterData.constituency_number,
        constituency_name: fullCenterData.constituency_name,
        center_no: fullCenterData.center_no,
        center: fullCenterData.center,
        gender: fullCenterData.gender,
        co_ordinate: fullCenterData.co_ordinate || { lat: 0, lon: 0 },
        map_link: fullCenterData.map_link,
        total_voters: fullCenterData.total_voters,
        total_valid_votes: fullCenterData.total_valid_votes,
        total_invalid_votes: fullCenterData.total_invalid_votes,
        total_votes_cast: fullCenterData.total_votes_cast,
        turnout_percentage: fullCenterData.turnout_percentage,
        participant_info:
          fullCenterData.participant_info && fullCenterData.participant_info.length > 0
            ? fullCenterData.participant_info
            : [
                {
                  name: '',
                  symbol: '',
                  vote: 0,
                },
              ],
      });
    } else if (visible && !center) {
      // Prefill form for create mode with props
      form.setFieldsValue({
        election: electionNumber,
        election_year: electionYear,
        constituency_id: constituencyNumber,
        constituency_name: constituencyName,
      });
    }
  }, [visible, isEditMode, fullCenterData, form, electionNumber, electionYear, constituencyNumber, constituencyName, center]);

  const handleSubmit = async (values: CreateCenterData) => {
    try {
      // Remove _id fields from participant_info (MongoDB internal IDs)
      const cleanedParticipantInfo = (values.participant_info || []).map(
        (participant) => {
          const { _id, ...rest } = participant as ParticipantInfo & {
            _id?: string;
          };
          return rest;
        }
      );

      const formData = {
        ...values,
        election: electionNumber,
        election_year: electionYear,
        constituency_id: constituencyNumber,
        constituency_name: constituencyName,
        participant_info: cleanedParticipantInfo,
      };

      if (isEditMode && fullCenterData) {
        const response = await updateCenter({
          id: fullCenterData._id,
          data: formData,
        }).unwrap();
        toast.success(response.message || 'Center updated successfully!', {
          duration: 4000,
          position: 'top-center',
        });
      } else {
        await createCenter(formData).unwrap();
        toast.success('Center created successfully!', {
          duration: 4000,
          position: 'top-center',
        });
      }

      form.resetFields();
      onClose();
      if (!isEditMode) {
        window.location.reload();
      }
    } catch (error: unknown) {
      console.error(
        `${isEditMode ? 'Update' : 'Create'} center error:`,
        error
      );

      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };
      const errorMessage =
        apiError?.data?.message ||
        apiError?.message ||
        `Failed to ${isEditMode ? 'update' : 'create'} center. Please check your authentication.`;

      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={
        <div className="flex items-center space-x-2">
          {isEditMode ? (
            <>
              <EditOutlined className="text-blue-600" />
              <span>Edit Center</span>
            </>
          ) : (
            <>
              <PlusOutlined className="text-blue-600" />
              <span>Create New Center</span>
            </>
          )}
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
              {isEditMode ? 'Update Center' : 'Create Center'}
            </Button>
          </div>
        }
      >
        {isLoadingCenter && isEditMode ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : (
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
        )}
      </Drawer>
  );
};

