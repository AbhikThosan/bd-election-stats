export interface Notification {
  _id: string;
  recipientId: string;
  userId: string;
  email: string;
  username: string;
  role: "admin" | "editor";
  type: "registration_approval";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateNotificationRequest {
  status: "approved" | "rejected";
}

export interface UpdateNotificationResponse {
  message: string;
}

