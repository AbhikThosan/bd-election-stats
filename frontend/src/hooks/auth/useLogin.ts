import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useLoginMutation } from '@/features/auth/slices/authApiSlice';
import { setCredentials } from '@/features/auth/slices/authCredentialSlice';
import { LoginFormValues, LoginResponse, ApiErrorResponse } from '@/types/auth';

export const useLogin = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = useCallback(async (formData: LoginFormValues): Promise<{
    success: boolean;
    data?: LoginResponse;
    error?: string;
  }> => {
    try {
      const response = await login(formData).unwrap();
      
      // Store credentials in Redux
      dispatch(setCredentials({ token: response.token, user: response.user }));
      
      // Show success toast
      toast.success('Login successful! Welcome back.', {
        duration: 3000,
        position: 'top-center',
      });
      
      // Redirect to dashboard/home page
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
      return { 
        success: true, 
        data: response 
      };
    } catch (error: unknown) {
      // Type-safe error handling
      const apiError = error as ApiErrorResponse;
      const errorMessage = apiError?.data?.message || 
                          apiError?.data?.error || 
                          'Login failed. Please check your credentials.';
      
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
  }, [login, dispatch, router]);

  return {
    handleLogin,
    isLoading,
  };
};
