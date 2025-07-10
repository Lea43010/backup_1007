import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, createContext } from "react";
import * as React from "react";

// AuthProvider is a simple pass-through component since authentication is handled by the server
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  try {
    // Safely try to get the QueryClient
    const queryClient = useQueryClient();
    
    const { data: user, isLoading, error, refetch } = useQuery({
      queryKey: ["/api/auth/user"],
      retry: false,
      enabled: true, // Enable query but handle 401 properly
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
      throwOnError: false, // Don't throw on 401 errors
      queryFn: async () => {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
          headers: {
            "Accept": "application/json",
          },
        });
        
        // If 401, user is not authenticated - return null instead of throwing
        if (response.status === 401) {
          return null;
        }
        
        // For other errors, throw
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      },
    });

    return {
      user,
      isLoading,
      isAuthenticated: !!user,
      error,
      refetch,
    };
  } catch (contextError) {
    // Fallback when QueryClient context is not available
    console.warn("QueryClient not available, returning default auth state");
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: contextError,
      refetch: () => {},
    };
  }
}
