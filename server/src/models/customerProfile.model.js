const mongoose = require('mongoose');

const customerProfileSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: [{
        type: String
    }],
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    avatarUrl: {
        type: String
    },
    gPointBalance: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CustomerProfile', customerProfileSchema, 'customerProfiles');