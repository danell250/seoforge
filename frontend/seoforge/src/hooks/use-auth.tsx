import {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, customFetch } from "@workspace/api-client-react";

interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  role: string;
  plan?: string;
}

interface SessionResponse {
  authenticated: boolean;
  user: AuthUser | null;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginPending: boolean;
  isSignupPending: boolean;
  isLogoutPending: boolean;
  errorMessage: string | null;
  login: (input: LoginInput) => Promise<SessionResponse>;
  signup: (input: LoginInput) => Promise<SessionResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<SessionResponse>;
}

const AUTH_SESSION_QUERY_KEY = ["auth", "session"] as const;

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) {
    const message =
      typeof error.data === "object" && error.data && "message" in error.data
        ? (error.data as { message?: unknown }).message
        : null;
    return typeof message === "string" && message.trim() ? message : error.message;
  }
  if (error instanceof Error) return error.message;
  return null;
}

async function fetchSession(): Promise<SessionResponse> {
  return customFetch<SessionResponse>("/api/auth/session", { method: "GET" });
}

async function loginRequest(input: LoginInput): Promise<SessionResponse> {
  return customFetch<SessionResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

async function signupRequest(input: LoginInput): Promise<SessionResponse> {
  return customFetch<SessionResponse>("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

async function logoutRequest(): Promise<void> {
  await customFetch<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: fetchSession,
    retry: false,
    staleTime: 30_000,
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, data);
    },
  });

  const signupMutation = useMutation({
    mutationFn: signupRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.setQueryData<SessionResponse>(AUTH_SESSION_QUERY_KEY, {
        authenticated: false,
        user: null,
      });
    },
  });

  const session = sessionQuery.data ?? {
    authenticated: false,
    user: null,
  };

  const value: AuthContextValue = {
    user: session.user,
    isAuthenticated: session.authenticated,
    isLoading: sessionQuery.isLoading,
    isLoginPending: loginMutation.isPending,
    isSignupPending: signupMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    errorMessage: getErrorMessage(sessionQuery.error),
    login: (input) => loginMutation.mutateAsync(input),
    signup: (input) => signupMutation.mutateAsync(input),
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    refreshSession: async () => {
      const data = await queryClient.fetchQuery({
        queryKey: AUTH_SESSION_QUERY_KEY,
        queryFn: fetchSession,
      });
      return data;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
