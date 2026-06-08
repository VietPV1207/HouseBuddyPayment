import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function WorkerLayout() {
  return (
    <div className="worker-layout">
      <aside className="sidebar">
        <h3>Worker</h3>
        <nav>
          <Link to="/worker/dashboard">Dashboard</Link>
          <Link to="/worker/orders">Orders</Link>
          <Link to="/worker/wallet">Wallet</Link>
          <Link to="/worker/services">Services</Link>
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default WorkerLayout;
