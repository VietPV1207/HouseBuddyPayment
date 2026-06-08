import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getMyOrders, updateOrderStatus } from '../api';
import { QRCodeCanvas } from 'qrcode.react';

function Orders() {
  const { user } = useAuth();
  const workerId = user?.id || '';
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [qrOrder, setQrOrder] = useState(null);

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

  const showQR = (order) => setQrOrder(order);
  const closeQR = () => setQrOrder(null);

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
                  {order.status === 'pending' && <button onClick={() => showQR(order)}>QR Code</button>}
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No orders</td></tr>}
          </tbody>
        </table>
      </div>

      {qrOrder && (
        <div className="modal">
          <div className="modal-content">
            <h3>QR Code Đơn Hàng</h3>
            <p>Mã đơn: {qrOrder._id}</p>
            <p>Khách hàng: {qrOrder.customer_id?.full_name}</p>
            <p>Dịch vụ: {qrOrder.service_id?.service_name}</p>
            <p>Số tiền: {qrOrder.amount?.toLocaleString()}</p>
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
              <QRCodeCanvas value={JSON.stringify({ orderId: qrOrder._id, amount: qrOrder.amount })} size={200} />
            </div>
            <button onClick={closeQR}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
