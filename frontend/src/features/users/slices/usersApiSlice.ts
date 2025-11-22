import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store/store";
import {
  UsersResponse,
  UserDetail,
  UserQueryParams,
  ApproveUserRequest,
  ApproveUserResponse,
  UpdateUserRoleRequest,
  UpdateUserRoleResponse,
  DeleteUserResponse,
} from "@/types/users";

export const usersApiSlice = createApi({
  reducerPath: "usersApi",
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
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UserQueryParams>({
      query: ({ page = 1, limit = 10, email, role, status }) => ({
        url: "/auth/users",
        method: "GET",
        params: {
          page,
          limit,
          ...(email && { email }),
          ...(role && { role }),
          ...(status && { status }),
        },
      }),
      providesTags: ["User"],
    }),
    getUserById: builder.query<UserDetail, string>({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    approveUser: builder.mutation<
      ApproveUserResponse,
      { id: string; data: ApproveUserRequest }
    >({
      query: ({ id, data }) => ({
        url: `/auth/users/${id}/approve`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User", "Notification"],
    }),
    updateUserRole: builder.mutation<
      UpdateUserRoleResponse,
      { id: string; data: UpdateUserRoleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/auth/users/${id}/role`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }, "User"],
    }),
    deleteUser: builder.mutation<DeleteUserResponse, string>({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Notification"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useApproveUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = usersApiSlice;

