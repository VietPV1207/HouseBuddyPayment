import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api, { getWorkerWallets, withdraw, deposit, getWalletHistory } from '../api';

const WALLET_LABELS = {
  credit: 'Ví Tín Dụng',
  personal: 'Ví Cá Nhân',
  corporate: 'Ví Công Ty',
};

function Wallet() {
  const { user } = useAuth();
  const workerId = user?.id || '';
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getLabel = (type) => WALLET_LABELS[type] || type;

  const ensureWallets = async () => {
    if (!workerId) return [];
    try {
      const res = await getWorkerWallets(workerId);
      const list = res.data || [];
      if (list.length === 0) {
        await Promise.all(
          ['credit', 'personal'].map((type) =>
            api.post('/wallets', { wallet_type: type, owner_id: workerId, owner_model: 'Worker', balance: 0 }),
          ),
        );
        const retry = await getWorkerWallets(workerId);
        return retry.data || [];
      }
      return list;
    } catch (e) {
      console.error('ensureWallets error:', e);
      setMessage('Không thể tải danh sách ví');
      return [];
    }
  };

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const list = await ensureWallets();
      setWallets(list);
      setSelectedWallet((prev) => {
        if (prev && list.some((w) => w._id === prev)) return prev;
        return list.length > 0 ? list[0]._id : null;
      });
    } catch (e) {
      setMessage('Không thể tải danh sách ví');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (walletId) => {
    if (!walletId) {
      setHistory([]);
      return;
    }
    try {
      const res = await getWalletHistory(walletId);
      setHistory(res.data || []);
    } catch (e) {
      console.error('fetchHistory error:', e);
      setHistory([]);
    }
  };

  useEffect(() => {
    if (!workerId) return;
    fetchWallets();
  }, [workerId]);

  useEffect(() => {
    if (selectedWallet) fetchHistory(selectedWallet);
  }, [selectedWallet]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!selectedWallet || !withdrawAmount) return;
    try {
      await withdraw(selectedWallet, Number(withdrawAmount));
      setMessage('Rút tiền thành công');
      setWithdrawAmount('');
      fetchWallets();
      fetchHistory(selectedWallet);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Rút tiền thất bại');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!selectedWallet || !depositAmount) return;
    const wallet = wallets.find((w) => w._id === selectedWallet);
    if (wallet?.wallet_type === 'credit' && (wallet.balance || 0) + Number(depositAmount) > 200000) {
      setMessage('Ví Tín Dụng chỉ được phép có tối đa 200.000');
      return;
    }
    try {
      await deposit(selectedWallet, Number(depositAmount));
      setMessage('Nạp tiền thành công');
      setDepositAmount('');
      fetchWallets();
      fetchHistory(selectedWallet);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Nạp tiền thất bại');
    }
  };

  const currentWallet = wallets.find((w) => w._id === selectedWallet);

  return (
    <div className="wallet">
      <h2>Wallet</h2>
      {message && <div className="message">{message}</div>}
      {loading && <div className="message">Đang tải ví...</div>}
      <div className="wallets">
        {wallets.map((w) => (
          <div
            key={w._id}
            className={`wallet-card ${w._id === selectedWallet ? 'active' : ''}`}
            onClick={() => setSelectedWallet(w._id)}
          >
            <strong>{getLabel(w.wallet_type)}</strong>
            <p>{(w.balance || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {currentWallet ? (
        <div className="wallet-detail">
          <h4>Transactions</h4>
          <form onSubmit={handleDeposit} className="deposit-form">
            {currentWallet.wallet_type === 'credit' && (
              <small>Số dư tối đa: 200.000 (Còn lại: {(200000 - (currentWallet.balance || 0)).toLocaleString()})</small>
            )}
            <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Deposit Amount" min="1" />
            <button type="submit">Deposit</button>
          </form>
          {currentWallet.wallet_type !== 'credit' && (
            <form onSubmit={handleWithdraw} className="withdraw-form">
              <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Amount" min="1" />
              <button type="submit">Withdraw</button>
            </form>
          )}
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
              {history.map((t) => (
                <tr key={t._id}>
                  <td>{t.transaction_type}</td>
                  <td>{(t.amount || 0).toLocaleString()}</td>
                  <td>{new Date(t.timestamp).toLocaleString()}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan="4">No transactions</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <div className="message">Chưa có ví nào</div>
      )}
    </div>
  );
}

export default Wallet;
