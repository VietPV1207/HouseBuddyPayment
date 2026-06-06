const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');

router.get('/', async (req, res) => {
  try {
    const wallets = await Wallet.find();
    res.json(wallets);
  } catch {
    res.status(500).json({ message: 'Error fetching wallets' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  } catch {
    res.status(500).json({ message: 'Error fetching wallet' });
  }
});

router.post('/', async (req, res) => {
  try {
    const wallet = new Wallet(req.body);
    await wallet.save();
    res.status(201).json(wallet);
  } catch {
    res.status(500).json({ message: 'Error creating wallet' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const wallet = await Wallet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  } catch {
    res.status(500).json({ message: 'Error updating wallet' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const wallet = await Wallet.findByIdAndDelete(req.params.id);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json({ message: 'Wallet deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting wallet' });
  }
});

module.exports = router;
