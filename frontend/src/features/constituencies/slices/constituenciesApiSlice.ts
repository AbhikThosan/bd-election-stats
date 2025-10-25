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
  tagTypes: ["Constituency"],
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
  }),
});

export const {
  useGetConstituenciesByElectionYearQuery,
  useCreateConstituencyMutation,
} = constituenciesApiSlice;
