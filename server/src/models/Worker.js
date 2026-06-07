const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  full_name: String,
  phone_number: String,
  email: String,
  skills: [String],
  rating: Number,
  status: String,
  wallet_credit_id: String,
  wallet_personal_id: String
});

module.exports = mongoose.model('Worker', workerSchema, 'workers');

