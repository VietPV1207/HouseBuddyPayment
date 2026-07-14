const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/api/payments/webhook', express.raw({ type: '*/*' }));
app.use(express.json());

// Mount existing routers
app.use('/api/auth', require('./src/routers/auth.router'));
app.use('/api/payments', require('./src/routers/payment.router'));
app.use('/api/payments', require('./src/routers/payosWebhook.router'));
app.use('/api/payment-records', require('./src/routers/paymentRecord.router'));
app.use('/api/wallets', require('./src/routers/wallet.router'));
app.use('/api/vouchers', require('./src/routers/voucher.router'));
app.use('/api/helpers', require('./src/routers/helper.router'));
app.use('/api/customers', require('./src/routers/customer.router'));
app.use('/api/admin-profiles', require('./src/routers/admin.router'));

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};

app.use(errorHandler);

app.get('/', (req, res) => {
  res.json({ message: 'HouseBuddy API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
