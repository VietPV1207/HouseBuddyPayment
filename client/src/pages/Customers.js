import React, { useState, useEffect } from 'react';
import { getCustomers } from '../api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getCustomers();
        setCustomers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (loading) return <p>Loading customers...</p>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Customers ({customers.length})</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Payment Preference</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.full_name}</td>
                <td>{customer.phone_number}</td>
                <td>{customer.email}</td>
                <td>{customer.address || '-'}</td>
                <td>{customer.payment_preference}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>
                  No customers found
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

export default Customers;
