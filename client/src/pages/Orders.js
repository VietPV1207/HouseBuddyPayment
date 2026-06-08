import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getMyOrders, updateOrderStatus } from '../api';

function Orders() {
  const { user } = useAuth();
  const workerId = user?.id || '';
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = async () => {
    try {
      const res = await getMyOrders(workerId, activeTab === 'all' ? undefined : activeTab);
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchOrders(); }, [workerId, activeTab]);

  const handleStatus = async (orderId, status, role = 'worker') => {
    try {
      await updateOrderStatus(orderId, status, role);
      fetchOrders();
    } catch (e) {
      alert('Update failed');
    }
  };

  return (
    <div className="orders">
      <h2>My Orders</h2>
      <div className="tabs">
        <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>All</button>
        <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>Pending</button>
        <button className={activeTab === 'assigned' ? 'active' : ''} onClick={() => setActiveTab('assigned')}>Assigned</button>
        <button className={activeTab === 'accepted' ? 'active' : ''} onClick={() => setActiveTab('accepted')}>Accepted</button>
        <button className={activeTab === 'in_progress' ? 'active' : ''} onClick={() => setActiveTab('in_progress')}>In Progress</button>
        <button className={activeTab === 'completed' ? 'active' : ''} onClick={() => setActiveTab('completed')}>Completed</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Address</th>
              <th>Time</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order.customer_id?.full_name || '-'}</td>
                <td>{order.customer_id?.address || '-'}</td>
                <td>{order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</td>
                <td>{order.amount?.toLocaleString()}</td>
<td>{order.status}</td>
                <td>
                  {order.status === 'assigned' && <button onClick={() => handleStatus(order._id, 'accepted')}>Accept</button>}
                  {order.status === 'accepted' && <button onClick={() => handleStatus(order._id, 'in_progress')}>Bắt đầu</button>}
                  {order.status === 'in_progress' && (
                    <>
                      {!order.worker_confirmed && <button onClick={() => handleStatus(order._id, 'completed', 'worker')}>Xác nhận hoàn thành</button>}
                      {!order.customer_confirmed && <span style={{ marginLeft: 8 }}>(Chờ khách hàng xác nhận)</span>}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No orders</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
