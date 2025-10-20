// API Error Types
export interface ApiError {
  status: number;
  data: {
    message: string;
    error?: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiErrorResponse {
  data?: {
    message: string;
    error?: string;
    details?: Record<string, unknown>;
  };
  status?: number;
}

// Registration specific types
export interface RegistrationRequest {
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'editor';
}

export interface RegistrationResponse {
  success: boolean;
  data?: {
    message: string;
    userId?: string;
  };
  error?: string;
}
