import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bike,
  Menu,
  X,
  CalendarDays,
  LogIn,
  LogOut,
} from "lucide-react";

import "./navbar.css";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  return (
    <header className="nav">
      {/* Mobile menu button - left side */}
      <button
        type="button"
        className="menu"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Logo */}
      <Link
        className="brand"
        to="/"
        onClick={() => setOpen(false)}
      >
        <Bike size={26} />
        <span>RideGo Bike & Taxi</span>
      </Link>

      {/* Mobile top actions */}
      <div className="mobileActions">
        {user && (
          <Link
            to="/bookings"
            className="mobileBookingBtn"
            onClick={() => setOpen(false)}
          >
            <CalendarDays size={16} />
            <span>Bookings</span>
          </Link>
        )}

        {user ? (
          <button
            type="button"
            className="mobileAuthBtn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="mobileAuthBtn"
            onClick={() => setOpen(false)}
          >
            <LogIn size={16} />
            <span>Login</span>
          </Link>
        )}
      </div>

      {/* Desktop and dropdown navigation */}
      <nav
        className={open ? "links open" : "links"}
        onClick={() => setOpen(false)}
      >
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/disclaimer">Disclaimer</Link>

        {user && (
          <Link
            to="/bookings"
            className="desktopBookingLink"
          >
            My Bookings
          </Link>
        )}

        {user?.role === "admin" && (
          <Link to="/admin">
            Admin Panel
          </Link>
        )}

        {user ? (
          <button
            type="button"
            className="logoutBtn desktopAuthBtn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <Link
            className="pill desktopAuthBtn"
            to="/login"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}