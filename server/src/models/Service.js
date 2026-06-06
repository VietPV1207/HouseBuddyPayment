const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  service_name: { type: String, required: true, unique: true },
  base_price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Service', serviceSchema);
