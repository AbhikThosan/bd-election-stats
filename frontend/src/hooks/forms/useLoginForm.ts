import { useState, useCallback } from 'react';
import { validateEmail } from '@/utils/validation';
import { LoginFormValues } from '@/types/auth';

export interface LoginFormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface LoginFormData {
  email: LoginFormField;
  password: LoginFormField;
}

export const useLoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: { value: '', touched: false },
    password: { value: '', touched: false },
  });

  const updateField = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: undefined,
      },
    }));
  }, []);

  const validateField = useCallback((field: keyof LoginFormData, value: string) => {
    let error: string | undefined;

    switch (field) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      
      case 'password':
        if (!value.trim()) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
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
  }, []);

  const validateForm = useCallback(() => {
    const fields: (keyof LoginFormData)[] = ['email', 'password'];
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
      password: { value: '', touched: false },
    });
  }, []);

  const getFormValues = useCallback((): LoginFormValues => {
    return {
      email: formData.email.value,
      password: formData.password.value,
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
