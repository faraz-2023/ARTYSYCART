import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import apiClient, { tokenStorage } from "@/services/apiClient";
import type {
  AuthState,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth";

// ---------------------------------------------------------------------------
// State & actions
// ---------------------------------------------------------------------------
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; tokens: AuthTokens } }
  | { type: "AUTH_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: User };

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
      };
    case "AUTH_FAILURE":
      return { ...state, isLoading: false };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Listen for forced logout triggered by the Axios refresh interceptor
  useEffect(() => {
    const handleForcedLogout = () => {
      dispatch({ type: "LOGOUT" });
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, [navigate]);

  // On mount, restore session from stored tokens
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        dispatch({ type: "AUTH_FAILURE" });
        return;
      }
      try {
        const { data } = await apiClient.get<User>("/auth/me");
        const tokens: AuthTokens = {
          access_token: accessToken,
          refresh_token: tokenStorage.getRefreshToken() ?? "",
          token_type: "bearer",
        };
        dispatch({ type: "AUTH_SUCCESS", payload: { user: data, tokens } });
      } catch {
        tokenStorage.clearTokens();
        dispatch({ type: "AUTH_FAILURE" });
      }
    };

    restoreSession();
  }, []);

  // ------------------------------------------------------------------
  // Login
  // ------------------------------------------------------------------
  const login = useCallback(async (payload: LoginPayload) => {
    dispatch({ type: "AUTH_START" });
    try {
      const { data: tokens } = await apiClient.post<AuthTokens>("/auth/login", payload);
      tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
      const { data: user } = await apiClient.get<User>("/auth/me");
      dispatch({ type: "AUTH_SUCCESS", payload: { user, tokens } });
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      throw error;
    }
  }, []);

  // ------------------------------------------------------------------
  // Register
  // ------------------------------------------------------------------
  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch({ type: "AUTH_START" });
    try {
      const { data: tokens } = await apiClient.post<AuthTokens>("/auth/register", payload);
      tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
      const { data: user } = await apiClient.get<User>("/auth/me");
      dispatch({ type: "AUTH_SUCCESS", payload: { user, tokens } });
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      throw error;
    }
  }, []);

  // ------------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      // Tell the server (best-effort — ignore errors, e.g. already-expired token)
      await apiClient.post("/auth/logout");
    } catch {
      // silently ignore
    } finally {
      tokenStorage.clearTokens();
      dispatch({ type: "LOGOUT" });
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ------------------------------------------------------------------
  // Update user in state (e.g. after profile edit)
  // ------------------------------------------------------------------
  const updateUser = useCallback((user: User) => {
    dispatch({ type: "SET_USER", payload: user });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
