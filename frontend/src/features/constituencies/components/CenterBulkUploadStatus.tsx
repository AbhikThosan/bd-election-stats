import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Progress, 
  Statistic, 
  Card, 
  Table, 
  Tag, 
  Space,
  Button,
  Typography,
  Alert,
  Spin
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  LoadingOutlined,
  FileTextOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { 
  useGetCenterBulkUploadStatusQuery, 
  useGetCenterBulkUploadErrorsQuery,
  BulkUploadStatus,
  BulkUploadErrors,
  UploadError
} from '@/features/constituencies/slices/constituenciesApiSlice';

const { Title, Text } = Typography;

interface CenterBulkUploadStatusModalProps {
  visible: boolean;
  uploadId: string;
  onClose: () => void;
}

export const CenterBulkUploadStatusModal: React.FC<CenterBulkUploadStatusModalProps> = ({
  visible,
  uploadId,
  onClose,
}) => {
  const [shouldPoll, setShouldPoll] = useState(true);

  // Poll status
  const { 
    data: status, 
    isLoading: statusLoading, 
    error: statusError 
  } = useGetCenterBulkUploadStatusQuery(uploadId, {
    pollingInterval: shouldPoll ? 2000 : 0,
    skip: !uploadId,
  });

  // Fetch errors if upload is completed or failed
  const { 
    data: errors, 
    isLoading: errorsLoading 
  } = useGetCenterBulkUploadErrorsQuery(uploadId, {
    skip: !uploadId || !status || (status.status !== 'completed' && status.status !== 'failed'),
  });

  useEffect(() => {
    // Stop polling when completed or failed
    if (status?.status === 'completed' || status?.status === 'failed') {
      setShouldPoll(false);
    }
  }, [status?.status]);

  const getStatusColor = (status: BulkUploadStatus['status']) => {
    switch (status) {
      case 'uploaded':
        return 'blue';
      case 'processing':
        return 'orange';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: BulkUploadStatus['status']) => {
    switch (status) {
      case 'processing':
        return <LoadingOutlined className="animate-spin" />;
      case 'completed':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'failed':
        return <CloseCircleOutlined className="text-red-500" />;
      default:
        return <FileTextOutlined />;
    }
  };

  const errorColumns = [
    {
      title: 'Row',
      dataIndex: 'row_number',
      key: 'row_number',
      width: 80,
    },
    {
      title: 'Center',
      dataIndex: 'center_no',
      key: 'center_no',
      render: (text: string, record: UploadError) => (
        <>
          <Text strong>#{record.constituency_number || 'N/A'}</Text>
          <br />
          <Text type="secondary">{text}</Text>
        </>
      ),
    },
    {
      title: 'Errors',
      dataIndex: 'errors',
      key: 'errors',
      render: (errors: Array<{ field: string; value: string; message: string }>) => (
        <Space direction="vertical" size="small" className="w-full">
          {errors.map((error, index) => (
            <div key={index} className="text-xs">
              <Tag color="red">{error.field}</Tag>
              <Text type="danger">{error.message}</Text>
            </div>
          ))}
        </Space>
      ),
    },
  ];

  if (statusLoading) {
    return (
      <Modal
        title="Upload Status"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  if (statusError || !status) {
    return (
      <Modal
        title="Upload Status"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <Alert
          message="Failed to load upload status"
          description="Unable to fetch upload status. Please try again later."
          type="error"
          showIcon
        />
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          {getStatusIcon(status.status)}
          <span>Upload Status</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <Button onClick={onClose}>
          {status.status === 'completed' || status.status === 'failed' ? 'Close' : 'Cancel'}
        </Button>
      }
      width="90%"
      className="max-w-[900px]"
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Tag color={getStatusColor(status.status)} className="text-sm sm:text-base px-2 sm:px-3 py-1 w-fit">
                {status.status.toUpperCase()}
              </Tag>
              <Text type="secondary" className="text-xs sm:text-sm break-all">
                <span className="hidden sm:inline">Upload ID: </span>
                {status.upload_id}
              </Text>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between mb-2 gap-1">
              <Text strong className="text-sm sm:text-base">Progress</Text>
              <Text className="text-xs sm:text-sm">
                {status.progress.percentage}% ({status.progress.processed} of {status.progress.total})
              </Text>
            </div>
            <Progress 
              percent={status.progress.percentage} 
              status={status.status === 'processing' ? 'active' : undefined}
              className="w-full"
            />
          </div>
        </Card>

        {/* Summary */}
        {status.summary && (
          <Card title={<span className="text-sm sm:text-base">Upload Summary</span>}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Statistic
                title={<span className="text-xs sm:text-sm">Successful</span>}
                value={status.summary.successful_inserts}
                valueStyle={{ color: '#52c41a', fontSize: '1rem' }}
                prefix={<CheckCircleOutlined />}
                className="text-center"
              />
              <Statistic
                title={<span className="text-xs sm:text-sm">Updated</span>}
                value={status.summary.updated_records}
                valueStyle={{ color: '#1890ff', fontSize: '1rem' }}
                className="text-center"
              />
              <Statistic
                title={<span className="text-xs sm:text-sm">Duplicates Skipped</span>}
                value={status.summary.skipped_duplicates}
                valueStyle={{ color: '#faad14', fontSize: '1rem' }}
                className="text-center"
              />
              <Statistic
                title={<span className="text-xs sm:text-sm">Errors</span>}
                value={status.summary.validation_errors}
                valueStyle={{ color: '#f5222d', fontSize: '1rem' }}
                prefix={<CloseCircleOutlined />}
                className="text-center"
              />
            </div>
          </Card>
        )}

        {/* Errors */}
        {errors && errors.validation_errors.length > 0 && (
          <Card 
            title={
              <div className="flex items-center space-x-2">
                <CloseCircleOutlined className="text-red-500 text-sm sm:text-base" />
                <span className="text-sm sm:text-base">
                  <span className="hidden sm:inline">Validation Errors </span>
                  ({errors.error_summary.total_errors})
                </span>
              </div>
            }
            extra={
              <Button 
                type="link" 
                icon={<DownloadOutlined />}
                onClick={() => {
                  // TODO: Implement download errors as CSV
                }}
                className="text-xs sm:text-sm p-0 sm:p-2"
              >
                <span className="hidden sm:inline">Download Errors</span>
                <span className="sm:hidden">Download</span>
              </Button>
            }
          >
            <Alert
              message="Some rows failed validation"
              description={
                <span className="text-xs sm:text-sm">
                  Total errors: {errors.error_summary.total_errors} 
                  <span className="hidden sm:inline"> 
                    {' '}({errors.error_summary.duplicate_errors} duplicates, {errors.error_summary.validation_errors} validation errors)
                  </span>
                </span>
              }
              type="error"
              showIcon
              className="mb-4"
            />
            <Table
              columns={errorColumns}
              dataSource={errors.validation_errors}
              rowKey={(record) => record.row_number.toString()}
              pagination={{ pageSize: 5 }}
              size="small"
              scroll={{ y: 200, x: true }}
              className="text-xs"
            />
          </Card>
        )}

        {/* Processing Time */}
        {status.processing_time && (
          <Text type="secondary" className="text-xs sm:text-sm">
            Processing time: {status.processing_time} seconds
          </Text>
        )}
      </div>
    </Modal>
  );
};

