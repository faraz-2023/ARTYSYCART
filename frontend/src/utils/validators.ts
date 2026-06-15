import { z } from "zod";

// ---------------------------------------------------------------------------
// Reusable field rules
// ---------------------------------------------------------------------------
const emailField = z
  .string()
  .min(1, "Email is required.")
  .email("Enter a valid email address.");

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters.")
      .max(150, "Full name is too long."),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(50, "Username is too long.")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username may only contain letters, numbers, hyphens, and underscores."
      ),
    email: emailField,
    password: passwordField,
    confirm_password: z.string().min(1, "Please confirm your password."),
    role: z.enum(["buyer", "seller"]),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match.",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------
export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
