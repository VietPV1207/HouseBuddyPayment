const mongoose = require('mongoose');

const typeVoucherSchema = new mongoose.Schema({
    holiday: {
        type: String,
        default: ''
    },
    complaint: {
        type: String,
        default: ''
    },
    referral: {
        type: String,
        default: ''
    },
    normalVoucher: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('TypeVoucher', typeVoucherSchema, 'typeVouchers');
