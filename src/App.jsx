import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Bookings from "./pages/Bookings";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import Services from "./pages/Services";
import AdminVehicles from "./pages/AdminVehicles";
import AdminOrders from "./pages/AdminOrders";

import SeoServicePage from "./pages/SeoServicePage";
import seoPages from "./data/seoPages";

import { useAuth } from "./context/AuthContext";

function Guard({ children, admin = false }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (admin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <div className="appLayout">
      <Navbar />

      <main className="appContent">
        <Routes>
          {/* Main pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />

          {/* Legal pages */}
          <Route path="/terms" element={<Legal type="terms" />} />
          <Route
            path="/disclaimer"
            element={<Legal type="disclaimer" />}
          />

          {/* 20 SEO pages */}
          {seoPages.map((page) => (
            <Route
              key={page.slug}
              path={`/${page.slug}`}
              element={<SeoServicePage page={page} />}
            />
          ))}

          {/* User bookings */}
          <Route
            path="/bookings"
            element={
              <Guard>
                <Bookings />
              </Guard>
            }
          />

          {/* Admin dashboard */}
          <Route
            path="/admin"
            element={
              <Guard admin>
                <Admin />
              </Guard>
            }
          />

          <Route
            path="/admin/vehicles"
            element={
              <Guard admin>
                <AdminVehicles />
              </Guard>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <Guard admin>
                <AdminOrders />
              </Guard>
            }
          />

          {/* Unknown URL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}