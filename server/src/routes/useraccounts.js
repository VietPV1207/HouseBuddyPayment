const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserAccount = require('../models/userAccount.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const { role, accountStatus } = req.query;
    const query = {};
    if (role) query.role = role;
    if (accountStatus) query.accountStatus = accountStatus;
    const accounts = await UserAccount.find(query);
    res.json(accounts);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid account id' });
  try {
    const account = await UserAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
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

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid account id' });
  try {
    const account = await UserAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid account id' });
  try {
    const account = await UserAccount.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
