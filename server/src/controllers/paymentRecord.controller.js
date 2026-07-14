const mongoose = require('mongoose');
const PaymentRecord = require('../models/paymentRecords.model');

exports.createPaymentRecord = async (req, res) => {
    try {
        const { bookingId, transactionId, paymentStatus, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ message: 'bookingId and amount are required' });
        }

        const paymentRecord = await PaymentRecord.create({
            bookingId: new mongoose.Types.ObjectId(bookingId),
            transactionId,
            paymentStatus: paymentStatus ?? 'pending',
            amount
        });

        res.status(201).json({
            message: 'Payment record created successfully',
            paymentRecord
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Transaction ID already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPaymentRecords = async (req, res) => {
    try {
        const { status, bookingId } = req.query;

        const filter = {};
        if (status) filter.paymentStatus = status;
        if (bookingId) filter.bookingId = new mongoose.Types.ObjectId(bookingId);

        const paymentRecords = await PaymentRecord.find(filter).sort({ createdAt: -1 });

        res.json({
            message: 'Payment records fetched successfully',
            paymentRecords
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPaymentRecordById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const paymentRecord = await PaymentRecord.findById(paymentId);

        if (!paymentRecord) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        res.json({
            message: 'Payment record fetched successfully',
            paymentRecord
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPaymentRecordsByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const paymentRecords = await PaymentRecord.find({ bookingId: new mongoose.Types.ObjectId(bookingId) }).sort({ createdAt: -1 });

        res.json({
            message: 'Booking payment records fetched successfully',
            paymentRecords
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePaymentRecord = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { bookingId, transactionId, paymentStatus, amount } = req.body;

        const paymentRecord = await PaymentRecord.findByIdAndUpdate(
            paymentId,
            {
                bookingId: bookingId ? new mongoose.Types.ObjectId(bookingId) : undefined,
                transactionId,
                paymentStatus,
                amount
            },
            { new: true, runValidators: true }
        );

        if (!paymentRecord) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        res.json({
            message: 'Payment record updated successfully',
            paymentRecord
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Transaction ID already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.deletePaymentRecord = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const paymentRecord = await PaymentRecord.findByIdAndDelete(paymentId);

        if (!paymentRecord) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        res.json({
            message: 'Payment record deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPaymentRecordByTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const paymentRecord = await PaymentRecord.findOne({ transactionId });

        if (!paymentRecord) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        res.json({
            message: 'Payment record fetched successfully',
            paymentRecord
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
