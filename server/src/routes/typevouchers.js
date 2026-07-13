const express = require('express');
const router = express.Router();
const TypeVoucher = require('../models/typeVoucher.model');

router.get('/', async (req, res, next) => {
  try {
    const types = await TypeVoucher.find();
    res.json(types);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const type = await TypeVoucher.findById(req.params.id);
    if (!type) return res.status(404).json({ message: 'TypeVoucher not found' });
    res.json(type);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const type = new TypeVoucher(req.body);
    await type.save();
    res.status(201).json(type);
  } catch (err) {
    next(Object.assign(new Error(err.message || 'Error creating typeVoucher'), { status: 400 }));
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const type = await TypeVoucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!type) return res.status(404).json({ message: 'TypeVoucher not found' });
    res.json(type);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const type = await TypeVoucher.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ message: 'TypeVoucher not found' });
    res.json({ message: 'TypeVoucher deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
