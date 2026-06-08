const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  status: { type: String, enum: ['pending', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  payment_method: { type: String, enum: ['cash', 'e-wallet'], default: 'cash' },
  payment_status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  payment_link: { type: String },
  orderCode: { type: Number, unique: true, sparse: true },
  amount: { type: Number, required: true, min: 0 },
  customer_confirmed: { type: Boolean, default: false },
  worker_confirmed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  completed_at: { type: Date }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Order', orderSchema);
