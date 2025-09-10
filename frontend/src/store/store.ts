import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import { persistedReducer } from "./persistConfig";
import { authApiSlice } from "@/features/auth/slices/authApiSlice";

export const store = configureStore({
  reducer: {
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    auth: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authApiSlice.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
