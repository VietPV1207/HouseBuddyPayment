import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'
});

export const getCustomers = () => api.get('/customers');
export const getWorkers = () => api.get('/workers');
export const getServices = () => api.get('/services');

export const getMyOrders = (workerId, status) => api.get(`/orders/my`, { params: { worker_id: workerId, status } });
export const getPendingCount = (workerId) => api.get(`/orders/pending-count/${workerId}`);
export const updateOrderStatus = (orderId, status) => api.patch(`/orders/${orderId}/status`, { status });

export const getWorkerWallets = (workerId) => api.get(`/wallets/worker/${workerId}`);
export const getWalletHistory = (walletId) => api.get(`/wallets/history/${walletId}`);
export const withdraw = (walletId, amount) => api.post('/wallets/withdraw', { wallet_id: walletId, amount });

export const updateWorker = (id, data) => api.put(`/workers/${id}`, data);

export default api;
