import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Home() {
  const { user } = useAuth();
  return (
    <div className="home">
      <h2>Welcome to HouseBuddy Payment</h2>
      <p>Please select a menu above to view customers, workers, or worker features.</p>
      {user?.role === 'customer' && (
        <div style={{ marginTop: 20 }}>
          <Link to="/create-order"><button>Tạo đơn hàng mới</button></Link>
          <Link to="/customer/orders"><button style={{ marginLeft: 10 }}>Xem đơn của tôi</button></Link>
        </div>
      )}
    </div>
  );
}

export default Home;
