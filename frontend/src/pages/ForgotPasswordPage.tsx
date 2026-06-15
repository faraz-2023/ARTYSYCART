import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/services/apiClient";
import { getErrorMessage } from "@/utils/errorHandler";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/utils/validators";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", values);
      setSubmitted(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4 text-center"
              >
                <div className="rounded-full bg-artysy-100 p-4 dark:bg-artysy-900/30">
                  <MailCheck className="h-8 w-8 text-artysy-600" />
                </div>
                <div>
                  <p className="font-medium">Check your inbox</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    If an account exists for that email, a reset link is on its way.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="text-sm font-medium text-artysy-600 hover:underline"
                >
                  Back to sign in
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FormField
                  id="email"
                  label="Email address"
                  required
                  error={errors.email?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="artysy"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Send reset link
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Remember it?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-artysy-600 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
