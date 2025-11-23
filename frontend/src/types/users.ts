export interface UserDetail {
  _id: string;
  email: string;
  username: string;
  role: "super_admin" | "admin" | "editor";
  status: "pending" | "active";
  createdAt: string;
}

export interface UsersResponse {
  users: UserDetail[];
  total: number;
  page: number;
  limit: number;
}

export interface ApproveUserRequest {
  approve: boolean;
}

export interface ApproveUserResponse {
  message: string;
}

export interface UpdateUserRoleRequest {
  role: "admin" | "editor";
}

export interface UpdateUserRoleResponse {
  message: string;
}

export interface DeleteUserResponse {
  message: string;
}

export interface ResetPasswordRequest {
  userId: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  email?: string;
  role?: "super_admin" | "admin" | "editor";
  status?: "pending" | "active";
}

