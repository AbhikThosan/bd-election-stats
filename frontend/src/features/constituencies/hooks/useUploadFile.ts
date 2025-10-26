import { useState } from 'react';
import Swal from 'sweetalert2';

interface UploadOptions {
  electionYear: number;
  onSuccess?: () => void;
}

export const useUploadFile = ({ electionYear, onSuccess }: UploadOptions) => {
  const [uploadVisible, setUploadVisible] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const handleUploadClick = () => {
    setUploadVisible(true);
  };

  const handleUploadClose = () => {
    setUploadVisible(false);
  };

  const handleUploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('election_year', electionYear.toString());
      formData.append('data_type', 'constituency');
      formData.append('overwrite_existing', 'false');
      formData.append('validate_only', 'false');

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      console.log('Upload - Token exists:', !!token);
      console.log('Upload - Election Year:', electionYear);
      console.log('Upload - Token value:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'Authentication Required',
          text: 'Your session has expired. Please log in again to upload files.',
          confirmButtonText: 'Go to Login',
          confirmButtonColor: '#dc2626',
          showCloseButton: true,
        }).then(() => {
          window.location.href = '/login';
        });
        return false;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/constituency-results/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: result.message || 'Failed to upload file. Please try again.',
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
        return false;
      }

      // Extract upload_id from response
      const uploadIdFromResponse = result.upload_id;
      if (uploadIdFromResponse) {
        setUploadId(uploadIdFromResponse);
      }

      Swal.fire({
        icon: 'success',
        title: 'Upload Started!',
        text: 'File uploaded successfully! Processing has started.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#22c55e',
        showCloseButton: true,
      }).then(() => {
        setUploadVisible(false);
        // Don't reload yet, wait for status modal
      });
      
      return false;
    } catch (error: unknown) {
      console.error('Upload error:', error);
      
      const errorMessage = (error as { message?: string })?.message || 'Failed to upload file. Please try again.';
      
      Swal.fire({
        icon: 'error',
        title: 'Upload Error',
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
      return false;
    }
  };

  return {
    uploadVisible,
    uploadId,
    handleUploadClick,
    handleUploadClose,
    handleUploadFile,
    setUploadId,
  };
};

