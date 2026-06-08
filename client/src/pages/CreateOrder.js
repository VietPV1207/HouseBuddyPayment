import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getServices, createOrder } from '../api';
import { QRCodeCanvas } from 'qrcode.react';

function CreateOrder() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [message, setMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedServiceId) {
      const service = services.find(s => s._id === selectedServiceId);
      if (service) {
        setAmount(service.base_price || 0);
      }
    }
  }, [selectedServiceId, services]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesRes = await getServices();
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
        payment_method: paymentMethod
      };
      
      const res = await createOrder(orderData);
      setCreatedOrder(res.data);
      
      if (paymentMethod === 'e-wallet' && res.data.payment_url) {
        setPaymentUrl(res.data.payment_url);
        setQrCode(res.data.qr_code || '');
      }
      setMessage('');
    } catch (e) {
      setMessage('Tạo đơn thất bại');
    } finally {
      setLoading(false);
    }
  };

  const closePayment = () => {
    setPaymentUrl('');
    setQrCode('');
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
            <label>Chọn dịch vụ:</label>
            <select value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)}>
              <option value="">-- Chọn dịch vụ --</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.service_name} - {s.base_price?.toLocaleString()}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Số tiền:</label>
            <input type="number" value={amount} readOnly />
          </div>
          <div className="form-group">
            <label>Phương thức thanh toán:</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="cash">Tiền mặt</option>
              <option value="e-wallet">Ví điện tử (PayOS)</option>
            </select>
          </div>
          <button onClick={handleCreateOrder} disabled={loading}>Tạo đơn</button>
          {message && <p>{message}</p>}
        </div>
      )}
      {user?.role !== 'customer' && <p>Chỉ khách hàng mới có thể tạo đơn.</p>}

      {paymentUrl && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thanh toán PayOS</h3>
            <p>Mã đơn: {createdOrder?._id?.slice(-6)}</p>
            <p>Số tiền: {createdOrder?.amount?.toLocaleString()}</p>
            {qrCode && (
              <div style={{ margin: '20px 0', textAlign: 'center' }}>
                <QRCodeCanvas value={qrCode} size={200} />
              </div>
            )}
            <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="pay-button">
              Thanh toán ngay
            </a>
            <br />
            <button onClick={closePayment}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateOrder;