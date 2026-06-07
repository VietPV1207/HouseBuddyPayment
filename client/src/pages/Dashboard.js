import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getPendingCount } from '../api';

function Dashboard() {
  const { user } = useAuth();
  const workerId = user?.id || '';
  const [pendingCount, setPendingCount] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      if (!workerId) return;
      try {
        const res = await getPendingCount(workerId);
        setPendingCount(res.data.count);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCount();
  }, [workerId]);

  return (
    <div className="dashboard">
      <h2>Worker Dashboard</h2>
      <div className="cards">
        <div className="card">
          <h3>Pending Orders</h3>
          <p className="number">{pendingCount ?? '-'}</p>
          <Link to="/worker/orders">View Orders</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
