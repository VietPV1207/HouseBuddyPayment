const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  wallet_type: { type: String, enum: ['corporate', 'credit', 'personal'], required: true },
  balance: { type: Number, default: 0, min: 0 },
  owner_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'owner_model', required: true },
  owner_model: { type: String, required: true, enum: ['Worker', 'Company'] },
  last_update: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Wallet', walletSchema);
