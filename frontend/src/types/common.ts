/**
 * Shared common types used across the application.
 */

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  requiresAuth?: boolean;
  roles?: string[];
}

export type Status = "idle" | "loading" | "success" | "error";

export interface ImageFile {
  id?: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export type SortOrder = "asc" | "desc";
