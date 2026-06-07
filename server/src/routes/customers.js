const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const customers = await Customer.find();
    console.info(`[customers] fetched ${customers.length} items`);
    console.debug(customers);
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid customer id' });
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    const msg = err.code === 11000
      ? 'Phone number or email already exists'
      : err.message || 'Error creating customer';
    next(Object.assign(new Error(msg), { status: 400 }));
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid customer id' });
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid customer id' });
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
