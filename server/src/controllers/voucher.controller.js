const mongoose = require('mongoose');
const Voucher = require('../models/voucher.model');

exports.createVoucher = async (req, res) => {
    try {
        const { code, type, value, customerId, usageLimit, status, expiryDate, isLocked } = req.body;

        if (!code || !type || !value || !customerId) {
            return res.status(400).json({ message: 'code, type, value and customerId are required' });
        }

        const voucher = await Voucher.create({
            code,
            type,
            value,
            customerId: new mongoose.Types.ObjectId(customerId),
            usageLimit: usageLimit ?? 1,
            status: status ?? 'active',
            expiryDate,
            isLocked: isLocked ?? false
        });

        res.status(201).json({
            message: 'Voucher created successfully',
            voucher
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Voucher code already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getAllVouchers = async (req, res) => {
    try {
        const { status, type, customerId } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (customerId) filter.customerId = new mongoose.Types.ObjectId(customerId);

        const vouchers = await Voucher.find(filter).sort({ createdAt: -1 });

        res.json({
            message: 'Vouchers fetched successfully',
            vouchers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVoucherById = async (req, res) => {
    try {
        const { voucherId } = req.params;

        const voucher = await Voucher.findById(voucherId);

        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.json({
            message: 'Voucher fetched successfully',
            voucher
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVouchersByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;

        const vouchers = await Voucher.find({ customerId: new mongoose.Types.ObjectId(customerId) }).sort({ createdAt: -1 });

        res.json({
            message: 'Customer vouchers fetched successfully',
            vouchers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateVoucher = async (req, res) => {
    try {
        const { voucherId } = req.params;
        const { code, type, value, customerId, usageLimit, status, expiryDate, isLocked } = req.body;

        const voucher = await Voucher.findByIdAndUpdate(
            voucherId,
            {
                code,
                type,
                value,
                customerId: customerId ? new mongoose.Types.ObjectId(customerId) : undefined,
                usageLimit,
                status,
                expiryDate,
                isLocked
            },
            { new: true, runValidators: true }
        );

        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.json({
            message: 'Voucher updated successfully',
            voucher
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Voucher code already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVoucher = async (req, res) => {
    try {
        const { voucherId } = req.params;

        const voucher = await Voucher.findByIdAndDelete(voucherId);

        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.json({
            message: 'Voucher deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.applyVoucher = async (req, res) => {
    try {
        const { voucherId } = req.params;

        const voucher = await Voucher.findById(voucherId);

        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        if (voucher.isLocked) {
            return res.status(400).json({ message: 'Voucher is locked' });
        }

        if (voucher.status !== 'active') {
            return res.status(400).json({ message: `Voucher is ${voucher.status}` });
        }

        if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Voucher has expired' });
        }

        if (voucher.usageLimit <= 0) {
            return res.status(400).json({ message: 'Voucher usage limit reached' });
        }

        voucher.usageLimit -= 1;
        voucher.status = voucher.usageLimit <= 0 ? 'used' : 'active';
        await voucher.save();

        res.json({
            message: 'Voucher applied successfully',
            voucher
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
