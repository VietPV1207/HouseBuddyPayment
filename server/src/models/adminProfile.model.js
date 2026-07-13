const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
    roleDetail: {
        type: String,
        required: true
    },
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'locked'],
        default: 'active'
    },
    voucherMgt: {
        type: mongoose.Schema.Types.ObjectId
    },
    rewardMgt: {
        type: mongoose.Schema.Types.ObjectId
    },
    fullName: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },
    email: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AdminProfile', adminProfileSchema, 'adminProfiles');