const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  wallet_source_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  wallet_target_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  amount: { type: Number, required: true, min: 0 },
  transaction_type: { type: String, enum: ['income', 'fee', 'refund'], required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Transaction', transactionSchema);
