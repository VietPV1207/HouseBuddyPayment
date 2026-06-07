import React from 'react';
import { Link, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Services from './pages/Services';
import Customers from './pages/Customers';
import Workers from './pages/Workers';
import WorkerLayout from './pages/WorkerLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import { useAuth } from './AuthContext';
import './App.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="App">
      <header className="App-header">
        <h1>HouseBuddy Payment</h1>
        <nav>
          {user ? (
            <>
              <Link to="/customers">Customers</Link>
              <Link to="/workers">Workers</Link>
              <Link to="/worker/dashboard">Worker</Link>
              <button onClick={logout} className="logout-btn">Logout ({user.name})</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/customers" element={user ? <Customers /> : <Navigate to="/login" />} />
          <Route path="/workers" element={user ? <Workers /> : <Navigate to="/login" />} />
          <Route element={user && user.role === 'worker' ? <WorkerLayout /> : <Navigate to="/login" />}>
            <Route path="/worker/dashboard" element={<Dashboard workerId={user?.id} />} />
            <Route path="/worker/orders" element={<Orders workerId={user?.id} />} />
            <Route path="/worker/wallet" element={<Wallet workerId={user?.id} />} />
            <Route path="/worker/services" element={<Services />} />
          </Route>
          <Route path="/" element={user && user.role === 'customer' ? <Home /> : <Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;