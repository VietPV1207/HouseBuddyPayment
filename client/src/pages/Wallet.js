import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getWorkerWallets, withdraw } from '../api';

function Wallet() {
  const { user } = useAuth();
  const workerId = user?.id || '';
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');

  const fetchWallets = async () => {
    if (!workerId) return;
    try {
      const res = await getWorkerWallets(workerId);
      setWallets(res.data);
      if (res.data.length > 0 && !selectedWallet) setSelectedWallet(res.data[0]._id);
    } catch (e) {
      setMessage('Failed to load wallets');
    }
  };

  const fetchHistory = async (walletId) => {
    try {
      const res = await getWalletHistory(walletId);
      setHistory(res.data);
    } catch (e) {
      setMessage('Failed to load history');
    }
  };

  useEffect(() => { fetchWallets(); }, [workerId]);
  useEffect(() => { if (selectedWallet) fetchHistory(selectedWallet); }, [selectedWallet]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!selectedWallet || !withdrawAmount) return;
    try {
      await withdraw(selectedWallet, Number(withdrawAmount));
      setMessage('Withdrawn successfully');
      setWithdrawAmount('');
      fetchWallets();
      fetchHistory(selectedWallet);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Withdraw failed');
    }
  };

  const currentWallet = wallets.find(w => w._id === selectedWallet);

  return (
    <div className="wallet">
      <h2>Wallet</h2>
      {message && <div className="message">{message}</div>}
      <div className="wallets">
        {wallets.map(w => (
          <div key={w._id} className={`wallet-card ${w._id === selectedWallet ? 'active' : ''}`} onClick={() => setSelectedWallet(w._id)}>
            <strong>{w.wallet_type}</strong>
            <p>{w.balance.toLocaleString()}</p>
          </div>
        ))}
      </div>
      {currentWallet && (
        <div className="wallet-detail">
          <h4>Transactions</h4>
          <form onSubmit={handleWithdraw} className="withdraw-form">
            <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Amount" min="1" />
            <button type="submit">Withdraw</button>
          </form>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(t => (
                <tr key={t._id}>
                  <td>{t.transaction_type}</td>
                  <td>{t.amount.toLocaleString()}</td>
                  <td>{new Date(t.timestamp).toLocaleString()}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan="4">No transactions</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Wallet;
