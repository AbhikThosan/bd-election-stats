import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authCredentialSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, logout } = authCredentialSlice.actions;
export default authCredentialSlice.reducer;
