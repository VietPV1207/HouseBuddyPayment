import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getWorkers, getServices, createOrder } from '../api';
import { QRCodeCanvas } from 'qrcode.react';

function CreateOrder() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workersRes, servicesRes] = await Promise.all([getWorkers(), getServices()]);
        setWorkers(workersRes.data);
        setServices(servicesRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const handleCreateOrder = async () => {
    if (!user?.id || !selectedServiceId || !amount) {
      setMessage('Vui lòng chọn dịch vụ và nhập số tiền');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        customer_id: user.id,
        service_id: selectedServiceId,
        amount: Number(amount),
        payment_method: 'cash'
      };
      if (selectedWorkerId) orderData.worker_id = selectedWorkerId;
      
      const res = await createOrder(orderData);
      setCreatedOrder(res.data);
      setMessage('');
    } catch (e) {
      setMessage('Tạo đơn thất bại');
    } finally {
      setLoading(false);
    }
  };

  const closeQR = () => {
    setCreatedOrder(null);
  };

  return (
    <div className="create-order">
      <h2>Tạo đơn hàng mới</h2>
      {user?.role === 'customer' && (
        <div className="form">
          <div className="form-group">
            <label>Khách hàng:</label>
            <input type="text" value={user?.full_name || user?.name || user?.id} readOnly />
          </div>
          <div className="form-group">
            <label>Chọn Worker (không bắt buộc):</label>
            <select value={selectedWorkerId} onChange={e => setSelectedWorkerId(e.target.value)}>
              <option value="">-- Chọn worker --</option>
              {workers.map(w => <option key={w._id} value={w._id}>{w.full_name} - {w.skills?.map(s => s.service_name).join(', ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Chọn dịch vụ:</label>
            <select value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)}>
              <option value="">-- Chọn dịch vụ --</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.service_name} - {s.base_price?.toLocaleString()}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Số tiền:</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Nhập số tiền" />
          </div>
          <button onClick={handleCreateOrder} disabled={loading}>Tạo đơn</button>
          {message && <p>{message}</p>}
        </div>
      )}
      {user?.role !== 'customer' && <p>Chỉ khách hàng mới có thể tạo đơn.</p>}

      {createdOrder && (
        <div className="modal">
          <div className="modal-content">
            <h3>QR Code Đơn Hàng</h3>
            <p>Mã đơn: {createdOrder._id}</p>
            <p>Dịch vụ: {createdOrder.service_id?.service_name}</p>
            <p>Số tiền: {createdOrder.amount?.toLocaleString()}</p>
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
              <QRCodeCanvas value={JSON.stringify({ orderId: createdOrder._id, amount: createdOrder.amount })} size={200} />
            </div>
            <button onClick={closeQR}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateOrder;