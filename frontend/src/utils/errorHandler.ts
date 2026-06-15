import { AxiosError } from "axios";
import type { ApiError } from "@/types/api";

/**
 * Extracts a human-readable message from an Axios error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;

    if (!data) {
      if (error.code === "ECONNABORTED") return "Request timed out.";
      if (!error.response) return "Network error. Check your connection.";
      return `Error ${error.response.status}: ${error.response.statusText}`;
    }

    if (typeof data.detail === "string") return data.detail;

    if (Array.isArray(data.detail)) {
      return data.detail.map((e) => e.msg).join(", ");
    }
  }

  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

/**
 * Returns field-level validation errors from a FastAPI 422 response.
 * Keys are dot-joined field paths (e.g. "body.email").
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof AxiosError && error.response?.status === 422) {
    const data = error.response.data as ApiError;
    if (Array.isArray(data.detail)) {
      return data.detail.reduce<Record<string, string>>((acc, e) => {
        const key = e.loc.slice(1).join(".");
        acc[key] = e.msg;
        return acc;
      }, {});
    }
  }
  return {};
}
