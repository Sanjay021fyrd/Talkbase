import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authAPI, formatApiError } from "../utils/api";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!token) {
      setApiError("Missing or invalid reset link.");
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        token,
        new_password: formData.password,
      });

      navigate("/login", {
        state: { message: "Password reset successfully. Please log in." },
      });
    } catch (error) {
      const msg =
        formatApiError(error.response?.data) ||
        "Could not reset password. The link may be invalid or expired.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-semibold text-gradient mb-2">
            Reset Password
          </h2>
          <p className="text-ink-400">Choose a new password for your account</p>
        </div>

        <Card>
          {!token && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              This reset link is missing or invalid. Please request a new one.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {apiError && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                {apiError}
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your new password"
              error={errors.password}
              required
              disabled={!token}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your new password"
              error={errors.confirmPassword}
              required
              disabled={!token}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            <Button type="submit" fullWidth disabled={loading || !token}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ink-400">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
              >
                Back to login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
