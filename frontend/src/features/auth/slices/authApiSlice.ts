import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginResponse, RegisterResponse, ApiErrorResponse } from "@/types/auth";
import { RootState } from "@/store/store";

export const authApiSlice = createApi({
  reducerPath: "authApi",
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
    register: builder.mutation<
      RegisterResponse,
      {
        email: string;
        username: string;
        password: string;
        role: "admin" | "editor";
      }
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      transformErrorResponse: (response: ApiErrorResponse) => {
        return {
          data: response.data,
          status: response.status,
        };
      },
    }),
    login: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformErrorResponse: (response: ApiErrorResponse) => {
        return {
          data: response.data,
          status: response.status,
        };
      },
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApiSlice;
