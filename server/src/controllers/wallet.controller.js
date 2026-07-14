const mongoose = require('mongoose');
const Wallet = require('../models/wallet.model');

exports.createWallet = async (req, res) => {
    try {
        const { userId, walletType, balance } = req.body;

        if (!userId || !walletType) {
            return res.status(400).json({ message: 'userId and walletType are required' });
        }

        const existingWallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (existingWallet) {
            return res.status(400).json({ message: 'Wallet already exists for this user' });
        }

        const wallet = await Wallet.create({
            userId: new mongoose.Types.ObjectId(userId),
            walletType,
            balance: balance ?? 0
        });

        res.status(201).json({
            message: 'Wallet created successfully',
            wallet
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Wallet already exists for this user' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getAllWallets = async (req, res) => {
    try {
        const { walletType } = req.query;

        const filter = {};
        if (walletType) filter.walletType = walletType;

        const wallets = await Wallet.find(filter).sort({ createdAt: -1 });

        res.json({
            message: 'Wallets fetched successfully',
            wallets
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWalletById = async (req, res) => {
    try {
        const { walletId } = req.params;

        const wallet = await Wallet.findById(walletId);

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        res.json({
            message: 'Wallet fetched successfully',
            wallet
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWalletByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found for this user' });
        }

        res.json({
            message: 'Wallet fetched successfully',
            wallet
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateWallet = async (req, res) => {
    try {
        const { walletId } = req.params;
        const { userId, walletType, balance, lastUpdate } = req.body;

        const wallet = await Wallet.findByIdAndUpdate(
            walletId,
            {
                userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
                walletType,
                balance,
                lastUpdate: lastUpdate ? new Date(lastUpdate) : undefined
            },
            { new: true, runValidators: true }
        );

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        res.json({
            message: 'Wallet updated successfully',
            wallet
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateWalletBalance = async (req, res) => {
    try {
        const { walletId } = req.params;
        const { balance } = req.body;

        if (typeof balance !== 'number') {
            return res.status(400).json({ message: 'Balance must be a number' });
        }

        const wallet = await Wallet.findByIdAndUpdate(
            walletId,
            {
                balance,
                lastUpdate: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        res.json({
            message: 'Wallet balance updated successfully',
            wallet
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteWallet = async (req, res) => {
    try {
        const { walletId } = req.params;

        const wallet = await Wallet.findByIdAndDelete(walletId);

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        res.json({
            message: 'Wallet deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
