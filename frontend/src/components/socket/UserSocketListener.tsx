"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/hooks/auth/useAuth";

/**
 * Component that listens for user-specific socket events
 * Should be rendered in the app layout
 */
export const UserSocketListener: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    // Listen for registration approval
    const handleRegistrationApproved = (data: { message: string }) => {
      message.success(data.message || "Your registration has been approved!");
      // Refresh the page to update user status
      // The user might have been approved while logged in
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };

    socket.on("registrationApproved", handleRegistrationApproved);

    return () => {
      socket.off("registrationApproved", handleRegistrationApproved);
    };
  }, [socket, isConnected, user, router]);

  return null; // This component doesn't render anything
};

