import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getFeatureImages } from "@/services/featureImages";
import type { FeatureImage } from "@/types";

const HomePage = () => {
  const { user, loading } = useAuth();
  const [featureImages, setFeatureImages] = useState<FeatureImage[]>([]);

  useEffect(() => {
    getFeatureImages().then(setFeatureImages).catch(() => []);
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
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return (
    <div className="pg min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-slate-800">Trinetra</span>
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

      {/* Feature images – scrolling section (admin-managed) */}
      {featureImages.length > 0 && (
        <section className="bg-white border-b border-slate-200 overflow-hidden">
          <div className="py-4">
            <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 px-4">
              Highlights
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 px-4 scroll-smooth scrollbar-thin" style={{ scrollbarWidth: "thin" }}>
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
                        {img.title && <p className="font-semibold text-sm">{img.title}</p>}
                        {img.caption && <p className="text-xs opacity-90 mt-0.5">{img.caption}</p>}
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          Your guide to the{" "}
          <span className="text-orange-600">Kumbh Mela</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
          Discover places, essentials, and plan your visit. Sign in to create itineraries, save your essentials & connect with family.
        </p>
        <p className="text-slate-500 text-sm max-w-xl mx-auto mb-10">
          Use the app on your phone or web — one account, same experience everywhere.
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
              { icon: "🏠", title: "Home", desc: "Overview, popular places, essentials by area & categories." },
              { icon: "📍", title: "Places", desc: "Pilgrimage & event locations with details and addresses." },
              { icon: "✓", title: "Essentials", desc: "Essential items and services; select yours and see by area." },
              { icon: "📋", title: "Plan", desc: "Create and manage your trip itineraries." },
              { icon: "🆘", title: "Emergency", desc: "Important helplines and emergency numbers." },
              { icon: "👨‍👩‍👧", title: "Family Connect", desc: "Keep family contacts handy and call with one tap." },
            ].map((item) => (
              <div key={item.title} className="card text-left flex items-start gap-4 hover:border-orange-200 transition-colors border border-transparent">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
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
          <Link to="/register" className="btn-primary max-w-xs mx-auto inline-block">
            Register for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-slate-500 text-sm">
          Trinetra — Your Kumbh Mela companion
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
