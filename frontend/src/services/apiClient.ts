import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? "/api/v1";

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15_000,
});

// ---------------------------------------------------------------------------
// Request interceptor — attach access token
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return Promise.reject(error);
    }

    const token = data.session?.access_token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Show toast for server errors (5xx), skip for 401/422 (handled elsewhere)
    if (
      error.response?.status &&
      error.response.status >= 500
    ) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
