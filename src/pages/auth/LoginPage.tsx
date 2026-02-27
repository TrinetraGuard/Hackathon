import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const ADMIN_EMAIL = "admin@trinetra.site";
  const ADMIN_PASSWORD = "Admin@123";

  React.useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const isAdminCreds =
        email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
      if (isAdminCreds) {
        try {
          await signUp(email, password, "Admin", "user");
        } catch (signUpErr: unknown) {
          setError(signUpErr instanceof Error ? signUpErr.message : "Sign in failed.");
        }
      } else {
        setError(err instanceof Error ? err.message : "Sign in failed. Check your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pg min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="text-lg font-bold text-slate-800">
            Kumbhathon
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
            <p className="text-slate-600 text-sm mb-6">
              Enter your credentials to access your account.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </div>
          <p className="mt-4 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
