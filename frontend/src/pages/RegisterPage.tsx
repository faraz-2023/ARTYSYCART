import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FormField } from "@/components/ui/FormField";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegisterMutation } from "@/hooks/useAuthMutations";
import { getFieldErrors } from "@/utils/errorHandler";
import { registerSchema, type RegisterFormValues } from "@/utils/validators";
import { cn } from "@/utils/cn";

export default function RegisterPage() {
  const { mutate: register, isPending, error } = useRegisterMutation();
  const fieldErrors = getFieldErrors(error);

  const {
    register: field,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "buyer",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = (values: RegisterFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirm_password, ...payload } = values;
    register(payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>
            Join thousands of artists and buyers on Artysy.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Role selector */}
            <div>
              <p className="mb-2 text-sm font-medium">
                I want to… <span className="text-destructive" aria-hidden>*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(["buyer", "seller"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setValue("role", r, { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                      selectedRole === r
                        ? "border-artysy-500 bg-artysy-50 dark:bg-artysy-950/20"
                        : "border-border hover:border-artysy-300"
                    )}
                    aria-pressed={selectedRole === r}
                  >
                    {r === "buyer" ? (
                      <ShoppingBag className="h-6 w-6 text-artysy-500" />
                    ) : (
                      <Palette className="h-6 w-6 text-artysy-500" />
                    )}
                    <span className="text-sm font-medium capitalize">
                      {r === "buyer" ? "Buy items" : "Sell my art"}
                    </span>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Full name */}
            <FormField
              id="full_name"
              label="Full name"
              required
              error={errors.full_name?.message ?? fieldErrors["full_name"]}
            >
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                error={errors.full_name?.message ?? fieldErrors["full_name"]}
                {...field("full_name")}
              />
            </FormField>

            {/* Username */}
            <FormField
              id="username"
              label="Username"
              required
              error={errors.username?.message ?? fieldErrors["username"]}
            >
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="janedoe"
                error={errors.username?.message ?? fieldErrors["username"]}
                {...field("username")}
              />
            </FormField>

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
                {...field("email")}
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
                autoComplete="new-password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                error={errors.password?.message ?? fieldErrors["password"]}
                {...field("password")}
              />
            </FormField>

            {/* Confirm password */}
            <FormField
              id="confirm_password"
              label="Confirm password"
              required
              error={errors.confirm_password?.message}
            >
              <PasswordInput
                id="confirm_password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                error={errors.confirm_password?.message}
                {...field("confirm_password")}
              />
            </FormField>

            <Button
              type="submit"
              variant="artysy"
              className="w-full"
              isLoading={isPending}
            >
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-artysy-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
