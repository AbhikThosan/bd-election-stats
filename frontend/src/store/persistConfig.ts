import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

export const persistedReducer = persistReducer(persistConfig, authReducer);
