import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI, formatApiError } from "../utils/api";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return;
    }

    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      setSubmitted(true);
    } catch (error) {
      const msg =
        formatApiError(error.response?.data) ||
        "Something went wrong. Please try again.";
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
            Forgot Password
          </h2>
          <p className="text-ink-400">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <Card>
          {submitted ? (
            <div className="text-center space-y-6">
              <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
                If that email exists, a password reset link has been sent.
                Check your inbox.
              </div>
              <Link
                to="/login"
                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {apiError && (
                  <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                    {apiError}
                  </div>
                )}

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  error={error}
                  required
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />

                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-ink-400">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
                  >
                    Back to login
                  </Link>
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
