const mongoose = require('mongoose');

const gPointSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomerProfile',
        required: true
    },
    exchange: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

gPointSchema.index({ customerId: 1 });

module.exports = mongoose.model('GPoint', gPointSchema, 'gPoints');
