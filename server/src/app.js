const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
// capture raw body for webhook signature verification while still parsing JSON
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use('/api/workers', require('./routes/workers'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/wallets', require('./routes/wallets'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/services', require('./routes/services'));
app.use('/api/payments', require('./routes/payments'));

app.get('/', (req, res) => {
  res.json({ message: 'HouseBuddy API' });
});

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};

app.use(errorHandler);

module.exports = app;