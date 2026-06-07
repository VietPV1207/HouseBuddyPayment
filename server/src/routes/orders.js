const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Worker = require('../models/Worker');
const Transaction = require('../models/Transaction');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/my', async (req, res, next) => {
  try {
    const { worker_id, status } = req.query;
    const query = {};
    if (worker_id && isValidId(worker_id)) query.worker_id = worker_id;
    if (status) query.status = status;
    const orders = await Order.find(query).populate('customer_id').populate('worker_id').populate('service_id');
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/pending-count/:worker_id', async (req, res, next) => {
  const { worker_id } = req.params;
  if (!isValidId(worker_id)) return res.status(400).json({ message: 'Invalid worker id' });
  try {
    const count = await Order.countDocuments({ worker_id, status: { $in: ['pending', 'assigned'] } });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
  const { status } = req.body;
  const allowed = ['accepted', 'in_progress', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('customer_id').populate('worker_id').populate('service_id');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status === 'completed' && order.worker_id && order.amount) {
      try {
        const worker = await Worker.findById(order.worker_id._id || order.worker_id);
        if (worker) {
          const walletIds = [worker.wallet_credit_id, worker.wallet_personal_id].filter(Boolean);
          for (const walletId of walletIds) {
            const wallet = await Wallet.findById(walletId);
            if (wallet) {
              wallet.balance += order.amount;
              wallet.last_update = new Date();
              await wallet.save();
              await Transaction.create({
                wallet_source_id: null,
                wallet_target_id: walletId,
                amount: order.amount,
                transaction_type: 'income',
                order_id: order._id,
                status: 'success'
              });
            }
          }
        }
      } catch (creditErr) {
        console.error('Auto-credit error:', creditErr);
      }
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { worker_id, status } = req.query;
    const query = {};
    if (status) query.status = status;
    const orders = await Order.find(query).populate('customer_id').populate('worker_id').populate('service_id');
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
  try {
    const order = await Order.findById(req.params.id).populate('customer_id').populate('worker_id').populate('service_id');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('customer_id').populate('worker_id').populate('service_id');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
