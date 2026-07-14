const mongoose = require('mongoose');
const payos = require('../utils/payos');
const Booking = require('../models/bookings.model');

const PAYOS_EXPIRED_STATUSES = new Set(['PAID', 'CANCELLED', 'FINISHED', 'REVIEWED']);

exports.createPayment = async (req, res) => {
    try {
        const {
            bookingCode,
            totalAmount,
            description,
            returnUrl,
            cancelUrl,
            webhookUrl
        } = req.body;

        const callbackUrl = webhookUrl || process.env.PAYOS_WEBHOOK_URL;

        if (!bookingCode || !totalAmount || Number(totalAmount) <= 0) {
            return res.status(400).json({ message: 'bookingCode và totalAmount (số dương) là bắt buộc' });
        }
        if (!description || !returnUrl || !cancelUrl) {
            return res.status(400).json({ message: 'description, returnUrl, cancelUrl là bắt buộc' });
        }
        if (!callbackUrl) {
            return res.status(400).json({ message: 'Thiếu callback/webhook URL' });
        }

        let booking;
        if (mongoose.Types.ObjectId.isValid(String(bookingCode))) {
            booking = await Booking.findById(bookingCode);
        } else {
            booking = await Booking.findOne({ orderCode: Number(bookingCode) });
        }
        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy Booking' });
        }

        if (PAYOS_EXPIRED_STATUSES.has(booking.status)) {
            return res.status(400).json({ message: `Booking đã ở trạng thái ${booking.status}, không thể tạo thanh toán` });
        }

        if (Number(totalAmount) !== Number(booking.totalAmount)) {
            return res.status(400).json({ message: 'totalAmount không khớp với booking.totalAmount' });
        }

        let orderCode = booking.orderCode;
        if (!orderCode) {
            orderCode = Number(String(Date.now()).slice(-9));
            booking.orderCode = orderCode;
        }
        booking.status = 'AWAITING_PAYMENT';
        await booking.save();

        const body = {
            orderCode,
            amount: Number(totalAmount),
            description: String(description).slice(0, 25),
            returnUrl,
            cancelUrl,
            webhookUrl: callbackUrl
        };

        const paymentLink = await payos.createPaymentLink(body);

        res.status(200).json({
            message: 'Tạo QR thanh toán thành công',
            qrCode: paymentLink.qrCode,
            checkoutUrl: paymentLink.checkoutUrl,
            accountNumber: paymentLink.accountNumber,
            bin: paymentLink.bin,
            orderCode: paymentLink.orderCode,
            amount: paymentLink.amount,
            status: paymentLink.status,
            expirationTime: paymentLink.expirationTime
        });
    } catch (error) {
        console.error('[PayOS CreatePayment] Lỗi:', error?.response?.data || error.message);
        const status = error?.response?.status || 502;
        res.status(status).json({
            message: 'Tạo thanh toán thất bại',
            error: error?.response?.data?.desc || error?.response?.data || error.message
        });
    }
};
