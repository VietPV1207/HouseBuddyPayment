const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const { status, worker_id } = req.query;
    const query = {};
    if (status) query.status = status;
    if (worker_id && isValidId(worker_id)) query.worker_id = worker_id;
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
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
