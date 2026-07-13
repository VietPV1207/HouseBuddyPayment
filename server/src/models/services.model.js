const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  categoryName: { type: String, required: true }, 
  packageName: { type: String, required: true },  
  basePrice: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Services', ServiceSchema, 'services');