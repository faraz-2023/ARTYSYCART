import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/utils/errorHandler";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

/**
 * Login mutation — calls AuthContext.login(), handles toast + redirect.
 */
export function useLoginMutation() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: () => {
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Register mutation — calls AuthContext.register(), handles toast + redirect.
 */
export function useRegisterMutation() {
  const { register } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: () => {
      toast.success("Account created! Welcome to Artysy.");
      navigate("/", { replace: true });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Logout action (not a mutation — just calls AuthContext.logout()).
 */
export function useLogout() {
  const { logout } = useAuth();
  return logout;
}
