const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone_number: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  skills: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }], default: [] },
  rating: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'busy'], default: 'active' },
  wallet_credit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  wallet_personal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Worker", workerSchema, "workers");