import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logout = () => {
    window.location.href = "/api/auth/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
