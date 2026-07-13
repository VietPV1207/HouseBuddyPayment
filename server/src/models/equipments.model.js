const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    quantity: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['available', 'in-use', 'maintenance'],
        default: 'available'
    }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema, 'equipments');
