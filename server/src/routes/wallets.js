const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Wallet = require('../models/wallet.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/user/:userId', async (req, res, next) => {
  const { userId } = req.params;
  if (!isValidId(userId)) return res.status(400).json({ message: 'Invalid user id' });
  try {
    const query = { userId };
    if (req.query.walletType) query.walletType = req.query.walletType;
    const wallets = await Wallet.find(query);
    res.json(wallets);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid wallet id' });
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    if (!req.body.userId) return res.status(400).json({ message: 'userId is required' });
    if (!req.body.walletType) return res.status(400).json({ message: 'walletType is required' });
    const wallet = new Wallet(req.body);
    await wallet.save();
    res.status(201).json(wallet);
  } catch (err) {
    const msg = err.code === 11000
      ? 'Wallet already exists for this user'
      : err.message || 'Error creating wallet';
    next(Object.assign(new Error(msg), { status: 400 }));
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid wallet id' });
  try {
    const wallet = await Wallet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid wallet id' });
  try {
    const wallet = await Wallet.findByIdAndDelete(req.params.id);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json({ message: 'Wallet deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/deposit', async (req, res, next) => {
  const { userId, walletType, amount } = req.body;
  if (!isValidId(userId)) return res.status(400).json({ message: 'Invalid user id' });
  if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  try {
    let wallet = await Wallet.findOne({ userId, walletType });
    if (!wallet) {
      wallet = await Wallet.create({ userId, walletType: walletType || 'personal', balance: 0 });
    }
    wallet.balance += amount;
    wallet.lastUpdate = new Date();
    await wallet.save();
    res.status(201).json(wallet);
  } catch (err) {
    next(err);
  }
});

router.post('/withdraw', async (req, res, next) => {
  const { userId, walletType, amount } = req.body;
  if (!isValidId(userId)) return res.status(400).json({ message: 'Invalid user id' });
  if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  try {
    const wallet = await Wallet.findOne({ userId, walletType });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    if (wallet.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    wallet.balance -= amount;
    wallet.lastUpdate = new Date();
    await wallet.save();
    res.status(201).json(wallet);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
