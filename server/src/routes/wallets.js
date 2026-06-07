const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Worker = require('../models/Worker');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/worker/:worker_id', async (req, res, next) => {
  const { worker_id } = req.params;
  if (!isValidId(worker_id)) return res.status(400).json({ message: 'Invalid worker id' });
  try {
    const wallets = await Wallet.find({ owner_id: worker_id, owner_model: 'Worker' });
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
    const wallet = new Wallet(req.body);
    await wallet.save();
    res.status(201).json(wallet);
  } catch (err) {
    next(err);
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

router.get('/history/:wallet_id', async (req, res, next) => {
  if (!isValidId(req.params.wallet_id)) return res.status(400).json({ message: 'Invalid wallet id' });
  try {
    const transactions = await Transaction.find({ $or: [{ wallet_source_id: req.params.wallet_id }, { wallet_target_id: req.params.wallet_id }] }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

router.post('/withdraw', async (req, res, next) => {
  const { wallet_id, amount } = req.body;
  if (!isValidId(wallet_id)) return res.status(400).json({ message: 'Invalid wallet id' });
  if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  try {
    const wallet = await Wallet.findById(wallet_id);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    if (wallet.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    wallet.balance -= amount;
    wallet.last_update = new Date();
    await wallet.save();
    const transaction = new Transaction({ wallet_source_id: wallet_id, wallet_target_id: null, amount, transaction_type: 'fee', status: 'success' });
    await transaction.save();
    res.status(201).json({ wallet, transaction });
  } catch (err) {
    next(err);
  }
});

router.post('/deposit', async (req, res, next) => {
  const { wallet_id, amount } = req.body;
  if (!isValidId(wallet_id)) return res.status(400).json({ message: 'Invalid wallet id' });
  if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  try {
    const wallet = await Wallet.findById(wallet_id);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    wallet.balance += amount;
    wallet.last_update = new Date();
    await wallet.save();
    const transaction = new Transaction({ wallet_source_id: null, wallet_target_id: wallet_id, amount, transaction_type: 'income', status: 'success', order_id: null });
    await transaction.save();
    res.status(201).json({ wallet, transaction });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
