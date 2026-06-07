import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api, { getWorkerWallets, withdraw, deposit } from '../api';

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

  const getLabel = (type) => WALLET_LABELS[type] || type;

  const createMissingWallets = async (workerId, existingTypes = []) => {
    const needed = ['credit', 'personal'].filter((t) => !existingTypes.includes(t));
    try {
      await Promise.all(needed.map((type) => api.post('/wallets', { wallet_type: type, owner_id: workerId, owner_model: 'Worker', balance: 0 })));
    } catch (e) {
      console.error('Create wallet failed:', e);
    }
  };

  const fetchWallets = async () => {
    if (!workerId) return;
    try {
      const res = await getWorkerWallets(workerId);
      const walletList = res.data || [];
      const types = walletList.map((w) => w.wallet_type);
      if (types.length === 0) {
        await createMissingWallets(workerId);
        const retry = await getWorkerWallets(workerId);
        setWallets(retry.data || []);
        if (retry.data?.length > 0 && !selectedWallet) setSelectedWallet(retry.data[0]._id);
      } else {
        setWallets(walletList);
        if (walletList.length > 0 && !selectedWallet) setSelectedWallet(walletList[0]._id);
      }
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

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!selectedWallet || !depositAmount) return;
    try {
      await deposit(selectedWallet, Number(depositAmount));
      setMessage('Deposited successfully');
      setDepositAmount('');
      fetchWallets();
      fetchHistory(selectedWallet);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Deposit failed');
    }
  };

  const currentWallet = wallets.find((w) => w._id === selectedWallet);

  return (
    <div className="wallet">
      <h2>Wallet</h2>
      {message && <div className="message">{message}</div>}
      <div className="wallets">
        {wallets.map((w) => (
          <div key={w._id} className={`wallet-card ${w._id === selectedWallet ? 'active' : ''}`} onClick={() => setSelectedWallet(w._id)}>
            <strong>{getLabel(w.wallet_type)}</strong>
            <p>{(w.balance || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {currentWallet && (
        <div className="wallet-detail">
          <h4>Transactions</h4>
          <form onSubmit={handleDeposit} className="deposit-form">
            <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Deposit Amount" min="1" />
            <button type="submit">Deposit</button>
          </form>
          <form onSubmit={handleWithdraw} className="withdraw-form">
            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Amount" min="1" />
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
      )}
    </div>
  );
}

export default Wallet;
