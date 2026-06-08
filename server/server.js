const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db'); // import hàm kết nối DB

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối MongoDB Atlas
connectDB();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/workers', require('./src/routes/workers'));
app.use('/api/customers', require('./src/routes/customers'));
app.use('/api/wallets', require('./src/routes/wallets'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/transactions', require('./src/routes/transactions'));
app.use('/api/services', require('./src/routes/services'));
app.use('/api/payments', require('./src/routes/payments'));

app.get('/', (req, res) => {
  res.json({ message: 'HouseBuddy API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
