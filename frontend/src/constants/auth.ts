export const AUTH_CONSTANTS = {
  ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
  } as const,
  
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
  },
  
  MESSAGES: {
    REGISTRATION_SUCCESS: 'Account created successfully! Please login to continue.',
    REGISTRATION_ERROR: 'Failed to create account. Please try again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
  },
} as const;

export const ROLE_OPTIONS = [
  {
    value: AUTH_CONSTANTS.ROLES.ADMIN,
    label: 'Administrator',
    description: 'Full access to all features',
  },
  {
    value: AUTH_CONSTANTS.ROLES.EDITOR,
    label: 'Editor',
    description: 'Limited access to content management',
  },
] as const;

