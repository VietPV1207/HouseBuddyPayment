const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('order_id').populate('wallet_source_id').populate('wallet_target_id');
    res.json(transactions);
  } catch {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('order_id').populate('wallet_source_id').populate('wallet_target_id');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch {
    res.status(500).json({ message: 'Error fetching transaction' });
  }
});

router.post('/', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch {
    res.status(500).json({ message: 'Error creating transaction' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch {
    res.status(500).json({ message: 'Error updating transaction' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting transaction' });
  }
});

module.exports = router;
