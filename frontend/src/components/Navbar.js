/**
 * Navigation Bar Component
 * 
 * Persistent header that appears on every page of the application.
 * Displays different content based on authentication status.
 * 
 * Features:
 * - App branding with icon and title 
 * - Conditional rendering based on login status:
 *   - Logged in: Shows username and logout button
 *   - Logged out: Shows login and register links
 * - Responsive design (styled in Navbar.css)
 *
 * Why a Separate Component?
 * - Reusable across all pages
 * - Keeps App.js cleaner by extracting navigation logic
 */

import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side: App branding */}
        <div className="navbar-left">
          {/* Clicking brand navigates to home (/) */}
          <Link to="/" className="navbar-brand">
            <div className="navbar-icon">✓</div>
            <span className="navbar-title">Hierarchical Todo</span>
          </Link>
        </div>
        
        {/* Right side: User info or auth links */}
        <div className="navbar-right">
          {/* Conditional rendering based on authentication status */}
          {user ? (
            // LOGGED IN: Show username and logout button
            <>
              {/* Display current user's username with icon */}
              <span className="navbar-user">
                <span className="navbar-user-icon">👤</span>
                {user.username}
              </span>
              
              {/* Logout button calls onLogout from App.js */}
              <button onClick={onLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            // LOGGED OUT: Show login and register links
            <>
              {/* Link to login page */}
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              
              {/* Link to register page (styled as primary action) */}
              <Link to="/register" className="navbar-link navbar-link-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

