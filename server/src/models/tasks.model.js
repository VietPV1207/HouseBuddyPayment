const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Services', 
    required: true // Bắt buộc phải gắn với 1 dịch vụ cụ thể
  },
  taskName: { type: String, required: true }, // VD: "Lau sàn", "Quét mạng nhện"
  price: { type: Number, default: 0 },         // Giá trị của riêng task này nếu có
  estimatedTime: { type: Number },             // Thời gian dự kiến (phút)
  note: { type: String }
}, { timestamps: true });

// Index để truy vấn danh sách task của 1 dịch vụ cực nhanh
TaskSchema.index({ serviceId: 1 });

module.exports = mongoose.model('Tasks', TaskSchema, 'tasks');