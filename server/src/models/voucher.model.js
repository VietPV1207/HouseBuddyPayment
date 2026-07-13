const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomerProfile',
        required: true
    },
    usageLimit: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['active', 'used', 'expired', 'inactive'],
        default: 'active'
    },
    expiryDate: {
        type: Date
    },
    isLocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

voucherSchema.index({ code: 1 });
voucherSchema.index({ customerId: 1 });

module.exports = mongoose.model('Voucher', voucherSchema, 'vouchers');
