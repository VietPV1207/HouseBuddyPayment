import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getWorkers, getCustomers } from '../api';

function Login() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [workersRes, customersRes] = await Promise.all([
          getWorkers(),
          getCustomers()
        ]);
        
        const workers = workersRes.data.map(w => ({
          ...w,
          role: 'worker'
        }));
        
        const customers = customersRes.data.map(c => ({
          ...c,
          role: 'customer'
        }));
        
        setUsers([...workers, ...customers]);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = (user) => {
    login(user.role, user._id, user.full_name);
    navigate(user.role === 'worker' ? '/worker/dashboard' : '/');
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Login</h2>
      <p>Select a user to login:</p>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} onClick={() => handleLogin(user)} className="clickable-row">
                <td>{user.full_name}</td>
                <td>{user.role === 'worker' ? 'Worker' : 'Customer'}</td>
                <td>{user.phone_number}</td>
                <td>{user.email}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Login;