const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Voucher = require('../models/voucher.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const { customerId, status } = req.query;
    const query = {};
    if (customerId && isValidId(customerId)) query.customerId = customerId;
    if (status) query.status = status;
    const vouchers = await Voucher.find(query);
    res.json(vouchers);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid voucher id' });
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json(voucher);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.status(201).json(voucher);
  } catch (err) {
    const msg = err.code === 11000
      ? 'Voucher code already exists'
      : err.message || 'Error creating voucher';
    next(Object.assign(new Error(msg), { status: 400 }));
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid voucher id' });
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json(voucher);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid voucher id' });
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json({ message: 'Voucher deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
