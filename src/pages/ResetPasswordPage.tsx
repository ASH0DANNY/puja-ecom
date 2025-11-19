import { useState, type FormEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useReduxAuth } from "../redux/useReduxAuth";
import toast from "react-hot-toast";
import { useScrollToTop } from "../utils/scrollToTop";
import { Lock, Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmPasswordReset } = useReduxAuth();
  const scrollToTop = useScrollToTop();

  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    scrollToTop();
  }, []);

  // Verify token validity
  useEffect(() => {
    const verifyToken = async () => {
      if (!oobCode) {
        setError("Invalid reset link. Please request a new one.");
        setValidToken(false);
        setCheckingToken(false);
        return;
      }

      try {
        // If we have an oobCode, we'll treat it as valid
        // Firebase will validate it when we try to use it
        setValidToken(true);
      } catch (err) {
        console.error("Token verification error:", err);
        setError("Invalid or expired reset link. Please request a new one.");
        setValidToken(false);
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [oobCode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!oobCode) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await confirmPasswordReset(oobCode, password);

      toast.success("Password reset successfully! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 lg:py-10">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Invalid Reset Link
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Request New Reset Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            {/* Header */}
            <div className="text-center pb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600">Enter your new password below</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label
                  htmlFor="password"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Lock className="w-4 h-4" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Resetting password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
