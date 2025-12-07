import { Navigate } from "react-router-dom";
import { useReduxAuth } from "../redux/useReduxAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, loading } = useReduxAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user's email is verified (skip for admins)
  if (!user.emailVerified && user.role !== "admin") {
    return <Navigate to="/signup" />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  // Disable cart, payment, and orders pages for admin users
  if (user.role === "admin") {
    const pathname = window.location.pathname;
    if (pathname === "/cart" || pathname === "/payment" || pathname === "/orders") {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
