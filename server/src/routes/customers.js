const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CustomerProfile = require('../models/customerProfile.model');
const UserAccount = require('../models/userAccount.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const customers = await CustomerProfile.find();
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid customer id' });
  try {
    const customer = await CustomerProfile.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const customer = new CustomerProfile(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    const msg = err.code === 11000
      ? 'Email already exists'
      : err.message || 'Error creating customer';
    next(Object.assign(new Error(msg), { status: 400 }));
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid customer id' });
  try {
    const customer = await CustomerProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid customer id' });
  try {
    const customer = await CustomerProfile.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
});

// ---- User accounts (auth/profile) ----

router.get('/accounts', async (req, res, next) => {
  try {
    const accounts = await UserAccount.find();
    res.json(accounts);
  } catch (err) {
    next(err);
  }
});

router.post('/accounts', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const account = new UserAccount(req.body);
    await account.save();
    res.status(201).json(account);
  } catch (err) {
    const msg = err.code === 11000
      ? 'Phone number already exists'
      : err.message || 'Error creating account';
    next(Object.assign(new Error(msg), { status: 400 }));
  }
});

module.exports = router;
