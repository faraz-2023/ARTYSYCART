/**
 * Generic paginated response from the API.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/**
 * Standard API error shape returned by FastAPI.
 */
export interface ApiError {
  detail: string | ValidationError[];
  status_code?: number;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/**
 * Generic success message response.
 */
export interface MessageResponse {
  message: string;
}

/**
 * Query params for list endpoints.
 */
export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
