import React from 'react';
import { Modal, Upload, Button, Space } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onClose,
  onUpload,
}) => {
  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/sample-constituency-results.csv';
    link.download = 'sample-constituency-results.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        }
        .swal-content {
          font-size: 16px;
          color: #374151;
          line-height: 1.5;
        }
        .swal-confirm-button {
          border-radius: 6px !important;
          font-weight: 500 !important;
          padding: 8px 24px !important;
        }
        .swal-confirm-button:hover {
          opacity: 0.9 !important;
        }
      `}</style>
      <Modal
        title="Upload Constituency Results File"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <div className="mb-4">
          <Space>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={handleDownloadSample}
            >
              Download Sample CSV
            </Button>
          </Space>
        </div>
        <Upload.Dragger
          name="file"
          accept=".csv,.xlsx,.xls"
          beforeUpload={(file) => {
            onUpload(file);
            return false;
          }}
          showUploadList={true}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined className="text-blue-600 text-4xl" />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for CSV, XLSX, XLS files. Ensure the file format matches the expected constituency results structure.
          </p>
        </Upload.Dragger>
      </Modal>
    </>
  );
};

