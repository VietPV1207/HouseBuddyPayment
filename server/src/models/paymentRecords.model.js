const mongoose = require('mongoose');

const paymentRecordSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    transactionId: {
        type: String,
        unique: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

paymentRecordSchema.index({ bookingId: 1 });

module.exports = mongoose.model('PaymentRecord', paymentRecordSchema, 'paymentRecords');
