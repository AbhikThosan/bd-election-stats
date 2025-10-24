import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Election {
  _id: string;
  election: number;
  election_year: number;
  total_constituencies: number;
  status: 'scheduled' | 'ongoing' | 'completed';
  total_valid_vote?: number;
  cancelled_vote?: number;
  total_vote_cast?: number;
  percent_valid_vote?: number;
  percent_cancelled_vote?: number;
  percent_total_vote_cast?: number;
  participant_details?: Array<{
    party: string;
    symbol: string;
    vote_obtained: number;
    percent_vote_obtain: number;
    seat_obtain: number;
    percent_seat_obtain: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ElectionsResponse {
  elections: Election[];
  total: number;
  page: number;
  limit: number;
}

export const electionsApiSlice = createApi({
  reducerPath: "electionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  tagTypes: ["Election"],
  endpoints: (builder) => ({
    getElections: builder.query<ElectionsResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/public/elections",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Election"],
    }),
    getElectionById: builder.query<Election, string>({
      query: (id) => ({
        url: `/public/elections/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Election", id }],
    }),
    createElection: builder.mutation<Election, Partial<Election>>({
      query: (body) => ({
        url: "/elections",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Election"],
    }),
    updateElection: builder.mutation<Election, { id: string; data: Partial<Election> }>({
      query: ({ id, data }) => ({
        url: `/elections/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Election", id }],
    }),
    deleteElection: builder.mutation<void, string>({
      query: (id) => ({
        url: `/elections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Election"],
    }),
  }),
});

export const {
  useGetElectionsQuery,
  useGetElectionByIdQuery,
  useCreateElectionMutation,
  useUpdateElectionMutation,
  useDeleteElectionMutation,
} = electionsApiSlice;
