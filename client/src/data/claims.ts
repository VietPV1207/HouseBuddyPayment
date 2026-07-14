export type ClaimStatus = 'approved' | 'pending' | 'reviewing' | 'needs-info' | 'rejected'

export type ClaimItem = {
  id: string
  title: string
  status: ClaimStatus
  bookingRef?: string
  date: string
  description: string
  resolutionNote?: string
  timeline: { label: string; date: string }[]
}

export const claimStatusLabel: Record<ClaimStatus, string> = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  reviewing: 'Đang xem xét',
  'needs-info': 'Cần bổ sung',
  rejected: 'Từ chối',
}

export const claims: ClaimItem[] = [
  {
    id: 'CL-1042',
    title: 'Bể vỡ đồ dùng trong quá trình dọn dẹp',
    status: 'approved',
    bookingRef: 'HB-24815',
    date: '12/10/2023',
    description:
      'Một chiếc bình gốm trên kệ tủ bị vỡ trong quá trình người giúp việc lau dọn phòng khách.',
    resolutionNote:
      'Yêu cầu đã được duyệt. Khoản bồi thường 350.000đ đã được cộng vào ví GPoint của bạn.',
    timeline: [
      { label: 'Đã gửi yêu cầu', date: '12/10/2023, 09:12' },
      { label: 'Đang xem xét', date: '12/10/2023, 14:20' },
      { label: 'Đã duyệt bồi thường', date: '13/10/2023, 10:05' },
    ],
  },
  {
    id: 'CL-1045',
    title: 'Thiếu dụng cụ vệ sinh',
    status: 'pending',
    date: '14/10/2023',
    description:
      'Người giúp việc không mang đủ dụng cụ vệ sinh chuyên dụng như đã cam kết trong gói dịch vụ.',
    timeline: [{ label: 'Đã gửi yêu cầu', date: '14/10/2023, 11:00' }],
  },
  {
    id: 'CL-1039',
    title: 'Trầy xước sàn gỗ',
    status: 'reviewing',
    bookingRef: 'HB-24102',
    date: '10/10/2023',
    description: 'Phát hiện vết trầy xước trên sàn gỗ phòng ngủ sau buổi dọn dẹp.',
    timeline: [
      { label: 'Đã gửi yêu cầu', date: '10/10/2023, 16:40' },
      { label: 'Đang xem xét', date: '11/10/2023, 09:00' },
    ],
  },
  {
    id: 'CL-1031',
    title: 'Mất đồ cá nhân',
    status: 'needs-info',
    date: '08/10/2023',
    description: 'Không tìm thấy một số đồ trang sức nhỏ sau buổi dọn dẹp.',
    resolutionNote:
      'Vui lòng bổ sung hình ảnh hoặc hóa đơn mua hàng của món đồ để chúng tôi tiếp tục xử lý.',
    timeline: [
      { label: 'Đã gửi yêu cầu', date: '08/10/2023, 08:30' },
      { label: 'Cần bổ sung hồ sơ', date: '09/10/2023, 15:10' },
    ],
  },
  {
    id: 'CL-0992',
    title: 'Hoàn phí dịch vụ',
    status: 'rejected',
    date: '02/10/2023',
    description: 'Yêu cầu hoàn phí do dịch vụ không đạt như mô tả.',
    resolutionNote:
      'Sau khi xem xét, yêu cầu không đủ điều kiện hoàn phí theo chính sách dịch vụ.',
    timeline: [
      { label: 'Đã gửi yêu cầu', date: '02/10/2023, 13:00' },
      { label: 'Từ chối yêu cầu', date: '03/10/2023, 09:45' },
    ],
  },
]
