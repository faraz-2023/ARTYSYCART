import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FormField } from "@/components/ui/FormField";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoginMutation } from "@/hooks/useAuthMutations";
import { getFieldErrors } from "@/utils/errorHandler";
import { loginSchema, type LoginFormValues } from "@/utils/validators";

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLoginMutation();
  const fieldErrors = getFieldErrors(error);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => login(values);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <FormField
              id="email"
              label="Email address"
              required
              error={errors.email?.message ?? fieldErrors["email"]}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message ?? fieldErrors["email"]}
                {...register("email")}
              />
            </FormField>

            {/* Password */}
            <FormField
              id="password"
              label="Password"
              required
              error={errors.password?.message ?? fieldErrors["password"]}
            >
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message ?? fieldErrors["password"]}
                {...register("password")}
              />
            </FormField>

            {/* Forgot link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="artysy"
              className="w-full"
              isLoading={isPending}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-artysy-600 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
