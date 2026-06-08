import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getOrdersByCustomer, updateOrderStatus } from '../api';

function CustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await getOrdersByCustomer(user.id);
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [user?.id]);

  const handleConfirmComplete = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'completed', 'customer');
      setMessage('Xác nhận thành công!');
      fetchOrders();
    } catch (e) {
      setMessage('Xác nhận thất bại');
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="customer-orders">
      <h2>Đơn hàng của tôi</h2>
      <Link to="/"><button style={{ marginRight: 10 }}>Quay về Home</button></Link>
      {message && <p>{message}</p>}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Worker</th>
              <th>Dịch vụ</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id?.slice(-6)}</td>
                <td>{order.worker_id?.full_name || '-'}</td>
                <td>{order.service_id?.service_name || '-'}</td>
                <td>{order.amount?.toLocaleString()}</td>
                <td>{order.status}</td>
                <td>
                  {order.status === 'in_progress' && (
                    <button onClick={() => handleConfirmComplete(order._id)}>Xác nhận hoàn thành</button>
                  )}
                  {order.status === 'completed' && <span>Đã hoàn thành</span>}
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Chưa có đơn hàng</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerOrders;