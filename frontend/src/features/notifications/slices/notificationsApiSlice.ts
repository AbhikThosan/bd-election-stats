import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store/store";
import {
  NotificationsResponse,
  UpdateNotificationRequest,
  UpdateNotificationResponse,
} from "@/types/notifications";

export const notificationsApiSlice = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/auth/notifications",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Notification"],
    }),
    updateNotification: builder.mutation<
      UpdateNotificationResponse,
      { id: string; data: UpdateNotificationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/auth/notifications/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useUpdateNotificationMutation,
} = notificationsApiSlice;

