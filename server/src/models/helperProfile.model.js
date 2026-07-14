const mongoose = require('mongoose');

const helperProfileSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    avatarUrl: {
        type: String
    },
    availability: {
        type: String
    },
    age: {
        type: Number
    },
    gender: {
        type: String
    },
    address: {
        type: String
    },
    skills: [{
        type: String
    }],
    identityVerified: {
        type: Boolean,
        default: false
    },
    identityDetails: {
        type: mongoose.Schema.Types.ObjectId
    },
    rating: {
        type: Number,
        default: 0
    },
    workStatus: {
        type: String,
        default: 'available'
    },
    currentZoneId: {
        type: mongoose.Schema.Types.ObjectId
    },
    equipment: {
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HelperProfile', helperProfileSchema, 'helperProfiles');