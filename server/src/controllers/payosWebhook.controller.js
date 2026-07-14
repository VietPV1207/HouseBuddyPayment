const crypto = require('crypto');
const Booking = require('../models/bookings.model');
const PaymentRecord = require('../models/paymentRecords.model');
const Wallet = require('../models/wallet.model');

const PAYOS_WEBHOOK_SECRET = process.env.PAYOS_CHECKSUM_KEY || process.env.PAYOS_WEBHOOK_SECRET || '';

function getRawBody(req) {
    if (req.rawBody) {
        return Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody);
    }
    if (Buffer.isBuffer(req.body)) return req.body;
    return Buffer.from(JSON.stringify(req.body || ''));
}

function verifySignature(rawBody, signature) {
    if (!PAYOS_WEBHOOK_SECRET || !signature) return false;
    const expected = crypto
        .createHmac('sha256', PAYOS_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(String(signature));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

exports.handlePayOSWebhook = async (req, res) => {
    const rawBody = getRawBody(req);
    const signature = req.headers['x-signature'] || req.headers['x-payos-signature'];

    const signatureValid = verifySignature(rawBody, signature);
    if (!signatureValid) {
        console.error('[PayOS Webhook] Xác thực chữ ký thất bại', {
            signature,
            rawBodyPreview: rawBody.toString('utf8').slice(0, 500)
        });
    }

    res.status(200).json({ message: 'Webhook received' });

    if (!signatureValid) return;

    try {
        let payload;
        try {
            payload = JSON.parse(rawBody.toString('utf8'));
        } catch (parseError) {
            console.error('[PayOS Webhook] Không thể parse raw body:', parseError);
            return;
        }

        const data = payload.data || payload;
        const bookingCode = data.orderCode || data.bookingCode;
        const status = String(data.status || payload.status || '').toUpperCase();
        const transactionId = data.transactionId || payload.transactionId;

        if (!bookingCode) {
            console.error('[PayOS Webhook] Thiếu bookingCode/orderCode trong payload', { payload });
            return;
        }

        console.log(`[PayOS Webhook] Nhận webhook bookingCode=${bookingCode} status=${status}`);

        const booking = await Booking.findOne({ orderCode: Number(bookingCode) });
        if (!booking) {
            console.error(`[PayOS Webhook] Không tìm thấy Booking với bookingCode=${bookingCode}`);
            return;
        }

        if (status === 'PAID') {
            await Booking.findByIdAndUpdate(booking._id, { status: 'PAID' });

            const existing = await PaymentRecord.findOne({
                bookingId: booking._id,
                paymentStatus: 'completed'
            });

            if (!existing) {
                await PaymentRecord.create({
                    bookingId: booking._id,
                    transactionId,
                    paymentStatus: 'completed',
                    amount: booking.totalAmount
                });
            }

            let corporateWallet = await Wallet.findOne({ walletType: 'corporate' });
            if (!corporateWallet) {
                corporateWallet = await Wallet.create({
                    userId: new (require('mongoose').default)(),
                    walletType: 'corporate',
                    balance: 0
                });
            }
            corporateWallet.balance = (corporateWallet.balance || 0) + booking.totalAmount;
            corporateWallet.lastUpdate = new Date();
            await corporateWallet.save();
        } else if (status === 'CANCELLED') {
            if (booking.status !== 'PAID') {
                await Booking.findByIdAndUpdate(booking._id, { status: 'CANCELLED' });
            }
        } else if (status === 'EXPIRED' || status === 'FAILED') {
            if (booking.status === 'AWAITING_PAYMENT') {
                await Booking.findByIdAndUpdate(booking._id, { status: 'DRAFT' });
            }
        } else {
            console.log(`[PayOS Webhook] Trạng thái không xử lý: ${status}`);
        }
    } catch (error) {
        console.error('[PayOS Webhook] Lỗi xử lý webhook:', error);
    }
};
