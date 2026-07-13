const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CustomerProfiles', 
    required: true 
  },
  helperId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HelperProfiles', 
    default: null 
  },
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Services', 
    required: true 
  },
  zoneId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ZoneAI'
  },
  scheduledTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // Đơn vị: giờ hoặc phút
  totalAmount: { type: Number, required: true },
  orderCode: { type: Number, unique: true, sparse: true },
  status: { 
    type: String, 
    enum: [
      'DRAFT',           // Nháp: Khách hàng đang thao tác, chưa chốt đơn
      'PENDING',         // Đã đặt, hệ thống đang tìm/gán Helper
      'CONFIRMED',       // Helper đã xác nhận, lịch đã được khóa
      'IN_PROGRESS',     // Helper đang thực hiện công việc
      'PAUSED',          // Tạm dừng (ví dụ: chờ khách)
      'COMPLETED',       // Helper đã hoàn thành công việc
      'AWAITING_PAYMENT',// Chờ thanh toán sau dịch vụ
      'PAID',            // Đã thanh toán thành công
      'FINISHED',        // Hoàn tất công việc + thanh toán
      'REVIEWED',        // Đã đánh giá xong (kết thúc hoàn toàn)
      'CANCELLED'        // Đơn bị hủy bởi khách, helper hoặc hệ thống
    ], 
    default: 'DRAFT' 
  },
  tasks: [{
     type: String }], // Danh sách công việc cụ thể trong buổi làm
  address: { 
    street: String,
    ward: String,
    district: String,
    city: String,
    coordinates: { lat: Number, lng: Number } // Rất hữu ích cho map
  }
}, { timestamps: true });

// Index để tối ưu tìm kiếm lịch sử đặt lịch của khách hoặc helper
BookingSchema.index({ customerId: 1, scheduledTime: -1 });
BookingSchema.index({ helperId: 1, scheduledTime: -1 });

module.exports = mongoose.model('Booking', BookingSchema, 'bookings');