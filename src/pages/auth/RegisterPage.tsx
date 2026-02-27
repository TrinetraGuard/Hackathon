import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

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
      await signUp(email, password, displayName, "user");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pg min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="text-lg font-bold text-slate-800">
            Trinetra
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Create account</h1>
            <p className="text-slate-600 text-sm mb-6">
              Register to access places and essentials.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Display name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-field"
                  placeholder="At least 6 characters"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-orange-600 hover:underline">
                Sign in
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
