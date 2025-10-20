import { AUTH_CONSTANTS } from '@/constants/auth';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < AUTH_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${AUTH_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }
  
  return { isValid: true };
};

export const validateUsername = (username: string): { isValid: boolean; message?: string } => {
  if (username.length < AUTH_CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Username must be at least ${AUTH_CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH} characters long`,
    };
  }
  
  if (username.length > AUTH_CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Username must be no more than ${AUTH_CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH} characters long`,
    };
  }
  
  // Check for valid characters (alphanumeric and underscore only)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      message: 'Username can only contain letters, numbers, and underscores',
    };
  }
  
  return { isValid: true };
};

export const getPasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= AUTH_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return strength;
};

export const getPasswordStrengthLabel = (strength: number): string => {
  switch (strength) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Fair';
    case 4:
      return 'Good';
    case 5:
      return 'Strong';
    default:
      return 'Very Weak';
  }
};

export const getPasswordStrengthColor = (strength: number): string => {
  switch (strength) {
    case 0:
    case 1:
      return '#dc2626'; // Red
    case 2:
      return '#d97706'; // Orange
    case 3:
      return '#f59e0b'; // Amber
    case 4:
      return '#059669'; // Green
    case 5:
      return '#1e40af'; // Blue
    default:
      return '#dc2626';
  }
};

