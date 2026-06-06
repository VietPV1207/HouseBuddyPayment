const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone_number: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  payment_preference: { type: String, enum: ['cash', 'e-wallet', 'bank'], default: 'cash' }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Customer', customerSchema);
