/**
 * Wrapper that pairs a Label + Input with react-hook-form field state.
 * Keeps form markup DRY across login / register / etc.
 */
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Label } from "./label";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive" aria-hidden>*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
