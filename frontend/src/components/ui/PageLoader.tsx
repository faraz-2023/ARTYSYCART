import { motion } from "framer-motion";

/**
 * Full-page loading spinner shown during lazy route loading
 * and initial auth session restore.
 */
export function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <motion.div
        className="h-10 w-10 rounded-full border-4 border-artysy-200 border-t-artysy-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
