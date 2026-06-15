import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Minimal layout for auth pages (login, register, forgot-password).
 * No nav or footer — just centered content.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Brand mark */}
      <Link to="/" className="mb-8">
        <span className="font-display text-3xl font-semibold text-artysy-600">
          Artysy
        </span>
      </Link>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
