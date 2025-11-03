/**
 * Registration Page Component
 * 
 * Allows new users to create an account with username and password.
 * This is a public route (accessible without being logged in).
 * 
 * Features:
 * - Username and password input fields
 * - Form validation (required fields)
 * - Error message display (username already exists, validation errors)
 * - Link to login page for existing users
 * - Automatic redirect to login page after successful registration
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  // Form input states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    /**
     * Handle registration form submission.
     * 
     * Backend performs:
     * - Username uniqueness check
     * - Password hashing (Werkzeug generate_password_hash)
     * - Database insertion
     */
    e.preventDefault();  // Prevent page reload
    setError("");        // Clear previous errors

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      // Registration successful!
      // Redirect to login page so user can log in with new credentials
      navigate("/login");
    } else {
      // Registration failed - display error from backend
      const data = await res.json();
      // Common errors: "Username already exists", "Username and password required"
      setError(data.error || "Registration failed");
    }
  };

  return (
    <div className="page-container">
      <h2>Create Account</h2>
      
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
      
      {/* Registration form */}
      <form onSubmit={handleRegister}>
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
          required  //cannot submit empty
        />
        
        {/* Submit button */}
        <button type="submit">Register</button>
      </form>
      
      {/* Link to login page for existing users */}
      <p
        style={{
          marginTop: "1rem",
          color: "var(--text-secondary)",
        }}
      >
        Already have an account?{" "}
        <Link
          to="/login"
          style={{
            color: "var(--primary)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Login
        </Link>
      </p>
    </div>
  );
}