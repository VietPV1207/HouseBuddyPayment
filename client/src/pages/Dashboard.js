import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getPendingCount, getCompanyWallet, getWalletHistory } from '../api';

function Dashboard() {
  const { user } = useAuth();
  const workerId = user?.id || '';
  const [pendingCount, setPendingCount] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [companyWallet, setCompanyWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (activeTab !== 'company') return;
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const [walletRes, historyRes] = await Promise.all([getCompanyWallet()]);
        setCompanyWallet(walletRes.data);
        if (walletRes.data?._id) {
          const hRes = await getWalletHistory(walletRes.data._id);
          setTransactions(hRes.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [activeTab]);

  return (
    <div className="dashboard">
      <h2>Worker Dashboard</h2>
      <div className="tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Tổng quan</button>
        <button className={activeTab === 'company' ? 'active' : ''} onClick={() => setActiveTab('company')}>Ví công ty</button>
      </div>
      {activeTab === 'overview' && (
        <div className="cards">
          <div className="card">
            <h3>Pending Orders</h3>
            <p className="number">{pendingCount ?? '-'}</p>
            <Link to="/worker/orders">View Orders</Link>
          </div>
        </div>
      )}
      {activeTab === 'company' && (
        <div className="company-wallet">
          {loading ? <p>Loading...</p> : (
            <>
              <div className="card">
                <h3>Số dư ví công ty</h3>
                <p className="number">{(companyWallet?.balance || 0).toLocaleString()} đ</p>
              </div>
              <h3>Lịch sử giao dịch</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Loại</th>
                      <th>Số tiền</th>
                      <th>Nguồn</th>
                      <th>Đích</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t._id}>
                        <td>{t.timestamp ? new Date(t.timestamp).toLocaleString() : '-'}</td>
                        <td>{t.transaction_type}</td>
                        <td style={{ color: t.wallet_target_id === companyWallet?._id ? 'green' : 'red' }}>
                          {t.wallet_target_id === companyWallet?._id ? '+' : '-'}{t.amount?.toLocaleString()}
                        </td>
                        <td>{t.wallet_source_id || '-'}</td>
                        <td>{t.wallet_target_id || '-'}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Chưa có giao dịch</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
