"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";
import { Spin } from "antd";
import { store, persistor } from "@/store/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreFromStorage } from "@/features/auth/slices/authCredentialSlice";
import { SocketProvider } from "@/contexts/SocketContext";
import { UserSocketListener } from "@/components/socket/UserSocketListener";

function AuthRestorer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore auth state from localStorage when the app initializes
    dispatch(restoreFromStorage());
  }, [dispatch]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={null}
        persistor={persistor}
      >
        <SocketProvider>
          <AuthRestorer />
          <UserSocketListener />
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
        </SocketProvider>
      </PersistGate>
    </Provider>
  );
}
