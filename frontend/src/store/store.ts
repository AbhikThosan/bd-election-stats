import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { authApiSlice } from "@/features/auth/slices/authApiSlice";
import { electionsApiSlice } from "@/features/elections/slices/electionsApiSlice";
import { constituenciesApiSlice } from "@/features/constituencies/slices/constituenciesApiSlice";
import authReducer from "@/features/auth/slices/authCredentialSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  debug: true, // Enable debug mode to see what's being persisted
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [electionsApiSlice.reducerPath]: electionsApiSlice.reducer,
    [constituenciesApiSlice.reducerPath]: constituenciesApiSlice.reducer,
    auth: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApiSlice.middleware, electionsApiSlice.middleware, constituenciesApiSlice.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
