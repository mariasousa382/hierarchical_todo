/**
 * Login Page Component
 * 
 * Handles user authentication through username/password credentials.
 * 
 * Features:
 * - Username and password input fields
 * - Form validation (required fields)
 * - Error message display for failed login attempts
 * - Link to registration page for new users
 * - Automatic redirect to home page on successful login
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage({ onLogin }) {
  // Form input states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Error message state (displayed when login fails)
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    /**
     * Handle login form submission.
     */
    e.preventDefault();  // Prevent page reload
    setError("");        // Clear previous errors
    
    try {
      // Send login request with credentials
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // Include session cookie in request
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      // Check if login failed
      if (!res.ok) {
        // Display error message from backend (e.g., "Invalid credentials")
        setError(data.error || "Login failed");
        return;
      }
      
      // Login successful!
      // Update App.js user state 
      onLogin(data.user);
      
      // Redirect to home page (App.js will show ListsPage)
      navigate("/");
    } catch (err) {
      // Network error (backend not responding, no internet, etc.)
      setError("Network error");
    }
  };

  return (
    <div className="page-container">
      <h2>Login</h2>
      
      {/* Conditional error message display */}
      {error && (
        <p
          style={{
            color: "var(--danger)",
            marginBottom: "1rem",
            padding: "0.75rem",
            background: "#ffe5e5",
            borderRadius: "var(--radius)",
            border: "1px solid var(--danger)",
          }}
        >
          {error}
        </p>
      )}
      
      {/* Login form */}
      <form onSubmit={handleSubmit}>
        {/* Username input - controlled component pattern */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required  // cannot submit empty
        />
        
        {/* Password input - masked for security */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required  // cannot submit empty
        />
        
        {/* Submit button */}
        <button type="submit">Login</button>
      </form>
      
      {/* Link to registration page for new users */}
      <p
        style={{
          marginTop: "1rem",
          color: "var(--text-secondary)",
        }}
      >
        No account?{" "}
        <Link
          to="/register"
          style={{
            color: "var(--primary)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Register
        </Link>
      </p>
    </div>
  );
}

