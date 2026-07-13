const mongoose = require('mongoose');

const HelperSchedulesSchema = new mongoose.Schema({
  helperId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HelperProfile', 
    required: true 
  },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: [
        'AVAILABLE',    //Ca trống cho phép đăng kí
        'PENDING',      // Đã dăng kí, chờ hệ thống duyệt
        'CONFIRMED',    // Đã được duyệt xác nhận
        'BOOKED',       // Đã có helper khác đặt
        'REJECTED',     // Admin từ chối ca đăng kí
        'CANCELLED',    // Huỷ ca do admin hoặc helper
        'OFF'           // Nghỉ làm
        ], 
    default: 'AVAILABLE' 
  },
  note:{ type:String}
}, { timestamps: true });

// Index để truy vấn lịch theo helper và ngày tháng nhanh hơn
HelperSchedulesSchema.index({ helperId: 1, date: 1, status:1 });

module.exports = mongoose.model('HelperSchedules', HelperSchedulesSchema, 'helperSchedules');