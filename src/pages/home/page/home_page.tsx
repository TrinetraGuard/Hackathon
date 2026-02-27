import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getFeatureImages } from "@/services/featureImages";
import type { FeatureImage } from "@/types";

const HomePage = () => {
  const { user, loading } = useAuth();
  const [featureImages, setFeatureImages] = useState<FeatureImage[]>([]);

  useEffect(() => {
    getFeatureImages()
      .then(setFeatureImages)
      .catch(() => []);
  }, []);

  if (loading) {
    return (
      <div className="pg min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  return (
    <div className="pg min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-orange-50/90 backdrop-blur-md sticky top-0 z-20 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <span className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-orange-600 to-red-500">
            <Link to="/">Trinetra</Link>
          </span>
          <nav className="flex items-center gap-6">
            <Link
              to="/login"
              className="relative text-slate-700 font-semibold text-sm px-2 py-1 rounded hover:text-orange-600 transition-colors duration-150 before:absolute before:-bottom-0.5 before:left-0 before:w-0 before:h-0.5 before:bg-orange-600 hover:before:w-full before:transition-all before:duration-150 33"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-block text-sm font-medium py-2 px-5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-lg transition-colors duration-150"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Feature images – scrolling section (admin-managed) */}
      {featureImages.length > 0 && (
        <section className="bg-white border-b border-slate-200 overflow-hidden">
          <div className="py-4">
            <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 px-4">
              Highlights
            </h2>
            <div
              className="flex gap-4 overflow-x-auto pb-2 px-4 scroll-smooth scrollbar-thin"
              style={{ scrollbarWidth: "thin" }}
            >
              {featureImages.map((img) => (
                <div
                  key={img.id}
                  className="flex-shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden bg-slate-100 shadow-md"
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      src={img.imageUrl}
                      alt={img.title || "Feature"}
                      className="w-full h-full object-cover"
                    />
                    {(img.title || img.caption) && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                        {img.title && (
                          <p className="font-semibold text-sm">{img.title}</p>
                        )}
                        {img.caption && (
                          <p className="text-xs opacity-90 mt-0.5">
                            {img.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero */}
      <section
        className="relative bg-cover bg-center h-[90vh]"
        style={{ backgroundImage: "url(Hero-sec.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <div className="absolute z-10 left-0 right-0 bottom-0 max-w-6xl mx-auto px-4 sm:px-6 text-center pb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Your guide to the{" "}
            <span className="text-orange-400">Kumbh Mela</span>
          </h1>
          <p className="text-lg text-slate-100 max-w-2xl mx-auto mb-8">
            Discover places, essentials, and plan your visit. Sign in to create
            itineraries, save your essentials & connect with family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="w-full sm:w-auto max-w-xs sm:max-w-[200px] px-6 py-3 bg-orange-600 text-white font-semibold rounded-md shadow transition-all duration-300 hover:bg-orange-700"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto max-w-xs sm:max-w-[200px] px-6 py-3 border border-orange-500 text-orange-500 rounded-md transition-all duration-300 hover:bg-orange-500 hover:text-white font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* App sections – options visible without login */}
      <section className="border-t border-slate-200 bg-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
            In the app
          </h2>
          <p className="text-slate-600 text-center text-sm mb-8 max-w-md mx-auto">
            Sign in to use these sections. Same experience on phone and web.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: "🏠",
                title: "Home",
                desc: "Overview, popular places, essentials by area & categories.",
              },
              {
                icon: "📍",
                title: "Places",
                desc: "Pilgrimage & event locations with details and addresses.",
              },
              {
                icon: "✓",
                title: "Essentials",
                desc: "Essential items and services; select yours and see by area.",
              },
              {
                icon: "📋",
                title: "Plan",
                desc: "Create and manage your trip itineraries.",
              },
              {
                icon: "🆘",
                title: "Emergency",
                desc: "Important helplines and emergency numbers.",
              },
              {
                icon: "👨‍👩‍👧",
                title: "Family Connect",
                desc: "Keep family contacts handy and call with one tap.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card text-left flex items-start gap-4 hover:border-orange-200 transition-colors border border-transparent"
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 py-12 bg-orange-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-600 mb-4">Ready to explore?</p>
          <Link
            to="/register"
            className="btn-primary max-w-xs mx-auto inline-block"
          >
            Register for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto py-10 px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-orange-500 font-semibold mb-2">Quick Links</h4>
            <nav className="flex flex-col gap-1 text-sm">
              <Link
                to="/"
                className="hover:text-orange-400 transition duration-200"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="hover:text-orange-400 transition duration-200"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="hover:text-orange-400 transition duration-200"
              >
                Register
              </Link>
            </nav>
          </div>
          <div>
            <h4 className="text-orange-500 font-semibold mb-2">
              Emergency Contacts
            </h4>
            <ul className="text-sm space-y-1">
              <li>Helpline: 123-456-7890</li>
              <li>Police: 100</li>
              <li>Ambulance: 101</li>
            </ul>
          </div>
          <div>
            <h4 className="text-orange-500 font-semibold mb-2">About</h4>
            <p className="text-sm">
              Trinetra is your go‑to companion for navigating the Kumbh Mela.
              Plan trips, save essentials, and stay connected with family.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 text-center text-xs">
          © {new Date().getFullYear()} Trinetra. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
