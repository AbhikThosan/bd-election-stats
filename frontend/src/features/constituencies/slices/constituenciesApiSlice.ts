import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store/store";

export interface ConstituencyParticipant {
  candidate: string;
  party: string;
  symbol: string;
  vote: number;
  percent: number;
}

export interface ConstituencyWinner {
  candidate: string;
  party: string;
  symbol: string;
  vote: number;
  percent: number;
}

export interface ConstituencyRunnerUp {
  candidate: string;
  party: string;
  symbol: string;
  vote: number;
  percent: number;
}

export interface Constituency {
  _id: string;
  election: number;
  election_year: number;
  constituency_number: number;
  constituency_name: string;
  total_voters: number;
  total_centers: number;
  reported_centers?: number;
  suspended_centers: number;
  total_valid_votes: number;
  cancelled_votes: number;
  total_turnout: number;
  percent_turnout: number;
  participant_details: ConstituencyParticipant[];
  winner?: ConstituencyWinner;
  runner_up?: ConstituencyRunnerUp;
  total_candidates?: number;
  margin_of_victory?: number;
  margin_percentage?: number;
}

export interface ConstituencyQueryParams {
  electionYear: number;
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'constituency_number' | 'constituency_name' | 'percent_turnout' | 'total_voters' | 'margin_of_victory';
  order?: 'asc' | 'desc';
  min_turnout?: number;
  max_turnout?: number;
  party?: string;
}

export interface ConstituenciesResponse {
  constituencies: Constituency[];
  election_year: number;
  total_constituencies: number;
  total: number;
  page: number;
  limit: number;
}

export interface CreateConstituencyData {
  election: number;
  election_year: number;
  constituency_number: number;
  constituency_name: string;
  total_voters: number;
  total_centers: number;
  reported_centers?: number;
  suspended_centers: number;
  total_valid_votes: number;
  cancelled_votes: number;
  total_turnout: number;
  percent_turnout: number;
  participant_details: ConstituencyParticipant[];
}

export interface BulkUploadProgress {
  processed: number;
  total: number;
  percentage: number;
}

export interface BulkUploadSummary {
  successful_inserts: number;
  updated_records: number;
  skipped_duplicates: number;
  validation_errors: number;
}

export interface BulkUploadStatus {
  upload_id: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: BulkUploadProgress;
  summary?: BulkUploadSummary;
  processing_time?: number;
  completed_at?: string;
}

export interface UploadError {
  row_number: number;
  constituency_number: number;
  constituency_name: string;
  errors: Array<{
    field: string;
    value: string;
    message: string;
  }>;
}

export interface BulkUploadErrors {
  upload_id: string;
  validation_errors: UploadError[];
  error_summary: {
    total_errors: number;
    duplicate_errors: number;
    validation_errors: number;
  };
}

export interface Center {
  _id: string;
  election: number;
  election_year: number;
  constituency_number: number;
  constituency_name: string;
  center_no: number;
  center: string;
  total_voters: number;
  total_votes_cast: number;
  turnout_percentage: number;
  total_valid_votes: number;
  total_invalid_votes: number;
  gender: 'male' | 'female' | 'both';
  co_ordinate?: {
    lat: number;
    lon: number;
  };
  map_link?: string;
  participant_info?: Array<{
    name: string;
    symbol: string;
    vote: number;
  }>;
}

export interface CentersResponse {
  centers: Center[];
  election_year: number;
  constituency_number: number;
  total_centers: number;
  total: number;
  page: number;
  limit: number;
}

export interface CentersQueryParams {
  electionYear: number;
  constituencyNumber: number;
  page?: number;
  limit?: number;
  sort?: 'center_no' | 'center_name' | 'turnout' | 'total_voters';
  order?: 'asc' | 'desc';
  gender?: 'male' | 'female' | 'both';
  min_turnout?: number;
  max_turnout?: number;
}

export interface ParticipantInfo {
  name: string;
  symbol: string;
  vote: number;
}

export interface CoOrdinate {
  lat: number;
  lon: number;
}

export interface CreateCenterData {
  election: number;
  election_year: number;
  constituency_id: number;
  constituency_name: string;
  center_no: number;
  center: string;
  gender: 'male' | 'female' | 'both';
  co_ordinate?: CoOrdinate;
  map_link?: string;
  total_voters: number;
  participant_info: ParticipantInfo[];
  total_valid_votes: number;
  total_invalid_votes: number;
  total_votes_cast: number;
  turnout_percentage: number;
}

export const constituenciesApiSlice = createApi({
  reducerPath: "constituenciesApi",
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
  tagTypes: ["Constituency", "Center"],
  endpoints: (builder) => ({
    getConstituenciesByElectionYear: builder.query<ConstituenciesResponse, ConstituencyQueryParams>({
      query: ({ electionYear, page = 1, limit = 10, search, sort = 'constituency_number', order = 'asc', min_turnout, max_turnout, party }) => ({
        url: `/public/constituencies/${electionYear}`,
        method: "GET",
        params: {
          page,
          limit,
          ...(search && { search }),
          sort,
          order,
          ...(min_turnout !== undefined && { min_turnout }),
          ...(max_turnout !== undefined && { max_turnout }),
          ...(party && { party }),
        },
      }),
      providesTags: (result, error, { electionYear }) => [
        { type: "Constituency", id: electionYear },
      ],
    }),
    createConstituency: builder.mutation<Constituency, CreateConstituencyData>({
      query: (body) => ({
        url: "/constituency-results",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { election_year }) => [
        { type: "Constituency", id: election_year },
      ],
    }),
    getBulkUploadStatus: builder.query<BulkUploadStatus, string>({
      query: (uploadId) => ({
        url: `/constituency-results/bulk-upload/${uploadId}`,
        method: "GET",
      }),
    }),
    getBulkUploadErrors: builder.query<BulkUploadErrors, string>({
      query: (uploadId) => ({
        url: `/constituency-results/bulk-upload/${uploadId}/errors`,
        method: "GET",
      }),
    }),
    getConstituencyByNumber: builder.query<Constituency, { electionYear: number; constituencyNumber: number }>({
      query: ({ electionYear, constituencyNumber }) => ({
        url: `/public/results/${electionYear}/${constituencyNumber}`,
        method: "GET",
      }),
    }),
    getCentersByConstituency: builder.query<CentersResponse, CentersQueryParams>({
      query: ({ electionYear, constituencyNumber, page = 1, limit = 10, sort = 'center_no', order = 'asc', gender, min_turnout, max_turnout }) => ({
        url: `/public/centers/${electionYear}/${constituencyNumber}`,
        method: "GET",
        params: {
          page,
          limit,
          sort,
          order,
          ...(gender && { gender }),
          ...(min_turnout !== undefined && { min_turnout }),
          ...(max_turnout !== undefined && { max_turnout }),
        },
      }),
    }),
    createCenter: builder.mutation<Center, CreateCenterData>({
      query: (body) => ({
        url: "/centers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Constituency"],
    }),
    getCenterByNumber: builder.query<Center, { electionYear: number; constituencyNumber: number; centerNumber: number }>({
      query: ({ electionYear, constituencyNumber, centerNumber }) => ({
        url: `/public/centers/${electionYear}/${constituencyNumber}/${centerNumber}`,
        method: "GET",
      }),
    }),
    bulkUploadCenters: builder.mutation<{ upload_id: string; status: string; message: string }, FormData>({
      query: (formData) => ({
        url: "/centers/bulk-upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Center"],
    }),
    getCenterBulkUploadStatus: builder.query<BulkUploadStatus, string>({
      query: (uploadId) => ({
        url: `/centers/bulk-upload/${uploadId}`,
        method: "GET",
      }),
    }),
    getCenterBulkUploadErrors: builder.query<BulkUploadErrors, string>({
      query: (uploadId) => ({
        url: `/centers/bulk-upload/${uploadId}/errors`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetConstituenciesByElectionYearQuery,
  useCreateConstituencyMutation,
  useGetBulkUploadStatusQuery,
  useGetBulkUploadErrorsQuery,
  useGetConstituencyByNumberQuery,
  useGetCentersByConstituencyQuery,
  useCreateCenterMutation,
  useGetCenterByNumberQuery,
  useBulkUploadCentersMutation,
  useGetCenterBulkUploadStatusQuery,
  useGetCenterBulkUploadErrorsQuery,
} = constituenciesApiSlice;
