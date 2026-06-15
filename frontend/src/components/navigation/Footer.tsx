import { Link } from "react-router-dom";

/**
 * Site footer — placeholder structure.
 */
export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Artysy. All rights reserved.</p>
        <nav className="flex gap-4">
          <Link to="/" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
