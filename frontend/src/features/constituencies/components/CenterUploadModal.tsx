import React from 'react';
import { Modal, Upload, message, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';

const { Text } = Typography;

const { Dragger } = Upload;

interface CenterUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export const CenterUploadModal: React.FC<CenterUploadModalProps> = ({
  visible,
  onClose,
  onUpload,
}) => {
  const props = {
    name: 'file',
    multiple: false,
    beforeUpload: async (file: File) => {
      try {
        await onUpload(file);
      } catch (error) {
        console.error('Upload error:', error);
      }
      return false; // Prevent auto upload
    },
    accept: '.xlsx,.xls,.csv',
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
      <Modal
        title="Upload Centers File"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <div className="py-6">
          <Text className="block mb-4 text-gray-600">
            Upload an Excel or CSV file containing center data. The file should include all required fields.
          </Text>
          <Dragger {...props} className="upload-dragger">
            <p className="ant-upload-drag-icon">
              <InboxOutlined className="text-blue-500" style={{ fontSize: '48px' }} />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for Excel (.xlsx, .xls) and CSV files.
            </p>
          </Dragger>
        </div>
      </Modal>
    </>
  );
};

