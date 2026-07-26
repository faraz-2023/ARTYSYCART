import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { uploadProfileImageToStorage } from "@/services/storage";
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
  uploadProfileImage: (file: File) => Promise<string>;
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

  const mapTokensFromSession = useCallback((session: Session): AuthTokens => {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token ?? "",
      token_type: "bearer",
    };
  }, []);

  const mapUserFromSupabase = useCallback((supabaseUser: SupabaseUser): User => {
    const meta = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>;
    const email = supabaseUser.email ?? "";
    const fallbackName = email ? email.split("@")[0] : "User";
    const roleValue = meta.role;
    const role =
      roleValue === "seller" || roleValue === "admin" || roleValue === "buyer"
        ? roleValue
        : "buyer";

    return {
      id: supabaseUser.id,
      email,
      username:
        typeof meta.username === "string" && meta.username.trim().length > 0
          ? meta.username
          : fallbackName,
      full_name:
        typeof meta.full_name === "string" && meta.full_name.trim().length > 0
          ? meta.full_name
          : fallbackName,
      role,
      profile_image:
        typeof meta.profile_image === "string" ? meta.profile_image : null,
      is_active: true,
      is_verified: Boolean(supabaseUser.email_confirmed_at),
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at ?? supabaseUser.created_at,
    };
  }, []);

  // On mount, restore session and keep auth state in sync with Supabase.
  useEffect(() => {
    const restoreSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        dispatch({ type: "AUTH_FAILURE" });
        return;
      }

      if (!data.session || !data.session.user) {
        dispatch({ type: "AUTH_FAILURE" });
        return;
      }

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: mapUserFromSupabase(data.session.user),
          tokens: mapTokensFromSession(data.session),
        },
      });
    };

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session || !session.user) {
        dispatch({ type: "LOGOUT" });
        return;
      }

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: mapUserFromSupabase(session.user),
          tokens: mapTokensFromSession(session),
        },
      });
    });

    return () => subscription.unsubscribe();
  }, [mapTokensFromSession, mapUserFromSupabase]);

  // ------------------------------------------------------------------
  // Login
  // ------------------------------------------------------------------
  const login = useCallback(async (payload: LoginPayload) => {
    dispatch({ type: "AUTH_START" });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        throw new Error("Login failed. No active session returned by Supabase.");
      }

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: mapUserFromSupabase(data.user),
          tokens: mapTokensFromSession(data.session),
        },
      });
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      throw error;
    }
  }, [mapTokensFromSession, mapUserFromSupabase]);

  // ------------------------------------------------------------------
  // Register
  // ------------------------------------------------------------------
  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch({ type: "AUTH_START" });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            username: payload.username,
            full_name: payload.full_name,
            role: payload.role,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Registration failed. Supabase did not return a user.");
      }

      if (!data.session) {
        dispatch({ type: "AUTH_FAILURE" });
        throw new Error("Account created. Please verify your email, then sign in.");
      }

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: mapUserFromSupabase(data.user),
          tokens: mapTokensFromSession(data.session),
        },
      });
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      throw error;
    }
  }, [mapTokensFromSession, mapUserFromSupabase]);

  // ------------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------------
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    dispatch({ type: "LOGOUT" });
    navigate("/login", { replace: true });
  }, [navigate]);

  const uploadProfileImage = useCallback(
    async (file: File) => {
      if (!state.user) {
        throw new Error("You must be signed in to upload a profile image.");
      }

      const uploadResult = await uploadProfileImageToStorage(state.user.id, file);
      const { data, error } = await supabase.auth.updateUser({
        data: { profile_image: uploadResult.publicUrl },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Profile image uploaded but failed to update your user profile.");
      }

      dispatch({ type: "SET_USER", payload: mapUserFromSupabase(data.user) });
      return uploadResult.publicUrl;
    },
    [mapUserFromSupabase, state.user]
  );

  // ------------------------------------------------------------------
  // Update user in state (e.g. after profile edit)
  // ------------------------------------------------------------------
  const updateUser = useCallback((user: User) => {
    dispatch({ type: "SET_USER", payload: user });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, uploadProfileImage, updateUser }}
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
