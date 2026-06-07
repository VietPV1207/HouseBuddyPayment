import React, { useState, useEffect } from 'react';
import { getWorkers } from '../api';

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await getWorkers();
        setWorkers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load workers');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  if (loading) return <p>Loading workers...</p>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Workers ({workers.length})</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Skills</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => (
              <tr key={worker._id}>
                <td>{worker.full_name}</td>
                <td>{worker.phone_number}</td>
                <td>{worker.email}</td>
                <td>{worker.skills?.map(s => typeof s === 'object' ? s.service_name : s).join(', ') || '-'}</td>
                <td>{worker.rating ?? '-'}</td>
                <td>{worker.status}</td>
              </tr>
            ))}
            {workers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#888' }}>
                  No workers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 16 }}><a href="/">Back to Home</a></p>
    </div>
  );
}

export default Workers;
