"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";
import { store, persistor } from "@/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 4000,
              style: {
                background: '#059669',
                color: '#fff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#dc2626',
                color: '#fff',
              },
            },
          }}
        />
      </PersistGate>
    </Provider>
  );
}
