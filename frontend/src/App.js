import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";import Navbar from "./components/Navbar";
import ListsPage from "./pages/ListsPage";
import TasksPage from "./pages/TasksPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentListId, setCurrentListId] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/current_user", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setCurrentListId(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <Router>
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <LoginPage onLogin={setUser} />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <RegisterPage onRegister={setUser} />}
          />
          <Route
            path="/"
            element={
              user ? (
                currentListId ? (
                  <TasksPage
                    listId={currentListId}
                    onBack={() => setCurrentListId(null)}
                  />
                ) : (
                  <ListsPage onSelectList={setCurrentListId} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;