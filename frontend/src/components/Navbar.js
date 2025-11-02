import React from "react";
import "./Navbar.css"; // 👈 we'll make this file next

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <h1 className="navbar-title">Todo App</h1>
      {user && (
        <div className="navbar-right">
          <span>👋 {user.username}</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
