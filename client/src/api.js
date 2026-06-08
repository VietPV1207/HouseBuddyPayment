import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL 
});

export const getCustomers = () => api.get('/customers');
export const getWorkers = () => api.get('/workers');
export const getServices = () => api.get('/services');

export const getMyOrders = (workerId, status) => api.get(`/orders/my`, { params: { worker_id: workerId, status } });
export const getOrdersByCustomer = (customerId) => api.get(`/orders/customer/${customerId}`);
export const getPendingCount = (workerId) => api.get(`/orders/pending-count/${workerId}`);
export const updateOrderStatus = (orderId, status, role) => api.patch(`/orders/${orderId}/status`, { status, role });
export const createOrder = (data) => api.post('/orders', data);

export const getWorkerWallets = (workerId) => api.get(`/wallets/worker/${workerId}`);
export const getCompanyWallet = () => api.get('/wallets/company-wallet');
export const getWalletHistory = (walletId) => api.get(`/wallets/history/${walletId}`);
export const withdraw = (walletId, amount) => api.post('/wallets/withdraw', { wallet_id: walletId, amount });
export const deposit = (walletId, amount) => api.post('/wallets/deposit', { wallet_id: walletId, amount });

export const updateWorker = (id, data) => api.put(`/workers/${id}`, data);

export default api;

// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'https://housebuddypayment.onrender.com' // backend đã deploy
// });

// export const getCustomers = () => api.get('/customers');
// export const getWorkers = () => api.get('/workers');
// export const getServices = () => api.get('/services');

// export const getMyOrders = (workerId, status) => api.get('/orders/my', { params: { worker_id: workerId, status } });
// export const getOrdersByCustomer = (customerId) => api.get(`/orders/customer/${customerId}`);
// export const getPendingCount = (workerId) => api.get(`/orders/pending-count/${workerId}`);
// export const updateOrderStatus = (orderId, status, role) => api.patch(`/orders/${orderId}/status`, { status, role });
// export const createOrder = (data) => api.post('/orders', data);

// export const getWorkerWallets = (workerId) => api.get(`/wallets/worker/${workerId}`);
// export const getCompanyWallet = () => api.get('/wallets/company-wallet');
// export const getWalletHistory = (walletId) => api.get(`/wallets/history/${walletId}`);
// export const withdraw = (walletId, amount) => api.post('/wallets/withdraw', { wallet_id: walletId, amount });
// export const deposit = (walletId, amount) => api.post('/wallets/deposit', { wallet_id: walletId, amount });

// export const updateWorker = (id, data) => api.put(`/workers/${id}`, data);

// export default api;
