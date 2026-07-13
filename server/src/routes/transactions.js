const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PaymentRecord = require('../models/paymentRecords.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const { bookingId, paymentStatus } = req.query;
    const query = {};
    if (bookingId && isValidId(bookingId)) query.bookingId = bookingId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    const records = await PaymentRecord.find(query).populate('bookingId');
    res.json(records);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid payment record id' });
  try {
    const record = await PaymentRecord.findById(req.params.id).populate('bookingId');
    if (!record) return res.status(404).json({ message: 'Payment record not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    if (!req.body.bookingId) return res.status(400).json({ message: 'bookingId is required' });
    if (!req.body.amount) return res.status(400).json({ message: 'amount is required' });
    const record = new PaymentRecord(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    next(Object.assign(new Error(err.message || 'Error creating payment record'), { status: 400 }));
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid payment record id' });
  try {
    const record = await PaymentRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Payment record not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid payment record id' });
  try {
    const record = await PaymentRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Payment record not found' });
    res.json({ message: 'Payment record deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
