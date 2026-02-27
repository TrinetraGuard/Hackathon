import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="pg min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return (
    <div className="pg min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-slate-800">Kumbhathon</span>
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-900 font-medium text-sm"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="btn-primary max-w-[120px] text-center text-sm py-2.5"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          Your guide to the{" "}
          <span className="text-blue-600">Kumbh Mela</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
          Discover pilgrimage places, essential information, and everything you need for a smooth experience. Register free and get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="btn-primary max-w-xs mx-auto sm:max-w-[200px]">
            Create account
          </Link>
          <Link
            to="/login"
            className="btn-secondary max-w-xs mx-auto sm:max-w-[200px]"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
            What you get
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="card text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Places</h3>
              <p className="text-slate-600 text-sm">
                Browse important pilgrimage and event locations with details and addresses.
              </p>
            </div>
            <div className="card text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Essentials</h3>
              <p className="text-slate-600 text-sm">
                Access a curated list of essential items and services for your visit.
              </p>
            </div>
            <div className="card text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Always up to date</h3>
              <p className="text-slate-600 text-sm">
                Information is kept current so you can plan with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-600 mb-4">Ready to explore?</p>
          <Link to="/register" className="btn-primary max-w-xs mx-auto inline-block">
            Register for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-slate-500 text-sm">
          Kumbhathon — Your Kumbh Mela companion
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
