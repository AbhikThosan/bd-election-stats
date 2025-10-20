import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '@/features/auth/slices/authApiSlice';
import { AUTH_CONSTANTS } from '@/constants/auth';
import { RegistrationRequest, RegistrationResponse, ApiErrorResponse } from '@/types/api';

export const useRegistration = () => {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const handleRegistration = useCallback(async (formData: RegistrationRequest): Promise<RegistrationResponse> => {
    try {
      const response = await register(formData).unwrap();
      
      // Show success toast
      toast.success(AUTH_CONSTANTS.MESSAGES.REGISTRATION_SUCCESS, {
        duration: 4000,
        position: 'top-center',
      });
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      
      return { 
        success: true, 
        data: response 
      };
    } catch (error: unknown) {
      // Type-safe error handling
      const apiError = error as ApiErrorResponse;
      const errorMessage = apiError?.data?.message || 
                          apiError?.data?.error || 
                          AUTH_CONSTANTS.MESSAGES.REGISTRATION_ERROR;
      
      // Show error toast
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [register, router]);

  return {
    handleRegistration,
    isLoading,
  };
};

