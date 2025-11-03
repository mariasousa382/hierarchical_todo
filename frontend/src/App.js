/*
Main React Application Component

This is the root component that manages:
- User authentication state
- Client-side routing (which page to show)
- Navigation between lists and tasks

Uses React Router for navigation without page reloads (SPA)
*/

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ListsPage from "./pages/ListsPage";
import TasksPage from "./pages/TasksPage";

export default function App() {
  // Global application state shared across all components
  const [user, setUser] = useState(null);
  
  // selectedListId: tracks which list is currently open
  // This allows navigation within the main page without changing URL
  const [selectedListId, setSelectedListId] = useState(null);

  // Check if user is already logged in from a previous session
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    /**
     * Check if there's an active session on the server.
     * Calls /api/me which is a protected route.
     */
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);  // User is logged in, store their info
      }
      // If not ok (401), user stays null and gets redirected to login
    } catch (err) {
      console.error("Auth check failed:", err);
      // Network error - user stays logged out
    }
  };

  const handleLogin = (userData) => {
    /**
     * Called after successful login from LoginPage.
     * Updates the global user state to reflect authentication.
     */
    setUser(userData);
  };

  const handleLogout = async () => {
    /**
     * Log out the current user.
     * - Call backend to destroy the session
     * - Clear local user state
     * - Clear selected list (return to clean slate)
     */
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setUser(null);  // Clear user from state
    setSelectedListId(null);  // Reset navigation state
  };

  const handleSelectList = (listId) => {
    /**
     * Navigate from lists overview to tasks view.
     */
    setSelectedListId(listId);
  };

  const handleBackToLists = () => {
    /**
     * Navigate from tasks view back to lists overview.
     */
    setSelectedListId(null);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Navbar appears on every page */}
        {/* Shows username and logout button if user is logged in */}
        <Navbar user={user} onLogout={handleLogout} />
        
        {/* Routes define which component to show based on URL */}
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                // If already logged in, redirect to home
                <Navigate to="/" replace />
              ) : (
                // If not logged in, show login form
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          
          {/* Register Route: /register */}
          <Route
            path="/register"
            element={
              user ? (
                // If already logged in, redirect to home
                <Navigate to="/" replace />
              ) : (
                // If not logged in, show registration form
                <RegisterPage onRegistered={handleLogin} />
              )
            }
          />
          
          {/* Home Route: / */}
          {/* This route shows different content based on authentication and selected list */}
          <Route
            path="/"
            element={
              user ? (
                // User is authenticated - show main app
                selectedListId ? (
                  // A list is selected - show its tasks
                  <TasksPage listId={selectedListId} onBack={handleBackToLists} />
                ) : (
                  // No list selected - show all lists
                  <ListsPage onSelectList={handleSelectList} />
                )
              ) : (
                // User is not authenticated - redirect to login
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}