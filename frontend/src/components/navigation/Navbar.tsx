import { Link, NavLink } from "react-router-dom";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, user, logout, uploadProfileImage } = useAuth();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    try {
      setIsUploadingImage(true);
      await uploadProfileImage(selectedFile);
      toast.success("Profile image updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image.";
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="font-display text-2xl font-semibold text-artysy-600"
        >
          Artysy
        </Link>

        {/* Primary nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            Explore
          </NavLink>
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={`${user.full_name} profile`}
                    className="h-7 w-7 rounded-full object-cover border"
                  />
                ) : (
                  <UserCircle className="h-5 w-5" />
                )}
                {user?.full_name}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploadingImage}
              >
                Upload photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void logout()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button variant="artysy" size="sm" asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
