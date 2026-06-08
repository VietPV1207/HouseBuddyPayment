import React, { useState, useEffect } from 'react';
import { getCompanyWallet, getWalletHistory } from '../api';

function CompanyWallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const walletRes = await getCompanyWallet();
        setWallet(walletRes.data);
        if (walletRes.data?._id) {
          const historyRes = await getWalletHistory(walletRes.data._id);
          setTransactions(historyRes.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="company-wallet-page">
      <h2>Ví công ty</h2>
      {loading ? <p>Loading...</p> : (
        <>
          <div className="card">
            <h3>Số dư hiện có</h3>
            <p className="number">{(wallet?.balance || 0).toLocaleString()} đ</p>
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
                    <td style={{ color: t.wallet_target_id === wallet?._id ? 'green' : 'red' }}>
                      {t.wallet_target_id === wallet?._id ? '+' : '-'}{t.amount?.toLocaleString()}
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
  );
}

export default CompanyWallet;
