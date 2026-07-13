import React from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreateOrder from "./pages/CreateOrder";
import "./App.css";

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <nav className="app-nav">
      <Link to="/">Home</Link>
      {user.role === "customer" && <Link to="/create-order">Tạo đơn</Link>}
      <button
        className="logout-btn"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Đăng xuất
      </button>
    </nav>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <div className="app">
      <Nav />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/create-order"
          element={
            <RequireAuth>
              <CreateOrder />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
