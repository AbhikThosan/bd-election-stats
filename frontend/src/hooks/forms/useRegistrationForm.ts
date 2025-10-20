import { useState, useCallback } from 'react';
import { message } from 'antd';
import { validateEmail, validatePassword, validateUsername } from '@/utils/validation';
import { AUTH_CONSTANTS } from '@/constants/auth';

export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface RegistrationFormData {
  email: FormField;
  username: FormField;
  password: FormField;
  confirmPassword: FormField;
  role: FormField;
}

export const useRegistrationForm = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: { value: '', touched: false },
    username: { value: '', touched: false },
    password: { value: '', touched: false },
    confirmPassword: { value: '', touched: false },
    role: { value: '', touched: false },
  });

  const updateField = useCallback((field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: undefined,
      },
    }));
  }, []);

  const validateField = useCallback((field: keyof RegistrationFormData, value: string) => {
    let error: string | undefined;

    switch (field) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      
      case 'username':
        const usernameValidation = validateUsername(value);
        if (!usernameValidation.isValid) {
          error = usernameValidation.message;
        }
        break;
      
      case 'password':
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          error = passwordValidation.message;
        }
        break;
      
      case 'confirmPassword':
        if (!value.trim()) {
          error = 'Please confirm your password';
        } else if (value !== formData.password.value) {
          error = 'Passwords do not match';
        }
        break;
      
      case 'role':
        if (!value) {
          error = 'Please select a role';
        }
        break;
    }

    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
        touched: true,
      },
    }));

    return !error;
  }, [formData.password.value]);

  const validateForm = useCallback(() => {
    const fields: (keyof RegistrationFormData)[] = ['email', 'username', 'password', 'confirmPassword', 'role'];
    let isValid = true;

    fields.forEach(field => {
      const fieldValid = validateField(field, formData[field].value);
      if (!fieldValid) {
        isValid = false;
      }
    });

    return isValid;
  }, [formData, validateField]);

  const resetForm = useCallback(() => {
    setFormData({
      email: { value: '', touched: false },
      username: { value: '', touched: false },
      password: { value: '', touched: false },
      confirmPassword: { value: '', touched: false },
      role: { value: '', touched: false },
    });
  }, []);

  const getFormValues = useCallback(() => {
    return {
      email: formData.email.value,
      username: formData.username.value,
      password: formData.password.value,
      role: formData.role.value as 'admin' | 'editor',
    };
  }, [formData]);

  return {
    formData,
    updateField,
    validateField,
    validateForm,
    resetForm,
    getFormValues,
  };
};

