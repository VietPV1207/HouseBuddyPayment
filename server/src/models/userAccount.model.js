const mongoose = require('mongoose');

const userAccountSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'helper'],
        required: true
    },
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'banned', 'pending', 'in-progress', 'locked'],
        default: 'pending'
    },
    otpCode: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    customerInfo: {
        type: mongoose.Schema.Types.Mixed
    },
    helperInfo: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserAccount', userAccountSchema, "userAccounts");