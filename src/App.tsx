import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { UserLayout } from "@/components/layouts/UserLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminAddPlacePage from "@/pages/admin/AdminAddPlacePage";
import AdminFeatureImagesPage from "@/pages/admin/AdminFeatureImagesPage";
import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";
import AdminPlacesPage from "@/pages/admin/AdminPlacesPage";
import AdminUserLocationsPage from "@/pages/admin/AdminUserLocationsPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ErrorPage from "@/pages/error/error_page";
import HomePage from "@/pages/home/page/home_page";
import EssentialsPage from "@/pages/user/EssentialsPage";
import FamilyConnectPage from "@/pages/user/FamilyConnectPage";
import ItineraryDetailPage from "@/pages/user/ItineraryDetailPage";
import MorePage from "@/pages/user/MorePage";
import PlacesPage from "@/pages/user/PlacesPage";
import PlanPage from "@/pages/user/PlanPage";
import UserDashboardPage from "@/pages/user/UserDashboardPage";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace /> : <RegisterPage />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<UserDashboardPage />} />
        <Route path="places" element={<PlacesPage />} />
        <Route path="essentials" element={<EssentialsPage />} />
        <Route path="plan" element={<PlanPage />} />
        <Route path="family-connect" element={<FamilyConnectPage />} />
        <Route path="more" element={<MorePage />} />
        <Route path="itinerary/:id" element={<ItineraryDetailPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="places" element={<AdminPlacesPage />} />
        <Route path="places/add" element={<AdminAddPlacePage />} />
        <Route path="feature-images" element={<AdminFeatureImagesPage />} />
        <Route path="user-locations" element={<AdminUserLocationsPage />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
