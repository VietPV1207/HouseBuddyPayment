# Plan: Dual Confirmation Before PayOS Redirect

## Current State

Backend hiện tại **không thể** thực hiện flow "cả helper và customer xác nhận trước khi redirect PayOS" vì:

1. **Booking router chỉ có GET / (admin)** — không có endpoint nào update status booking
2. **Booking controller chỉ có getAllBookings** — không có hàm update status
3. **Booking schema không có field confirmation** — không có `customerConfirmedAt`, `helperConfirmedAt`, hay mechanism tương tự
4. **createPayment không validate confirmation** — chỉ kiểm tra booking tồn tại và amount khớp, rồi set `AWAITING_PAYMENT` ngay
5. **Client định nghĩa nhiều endpoint booking lifecycle** (`completeJob`, `payBooking`...) nhưng **server không implement**

## Required Changes

### 1. Booking Model — Thêm confirmation tracking

Thêm 2 field vào `bookings.model.js`:
- `customerConfirmedAt`: Date | null
- `helperConfirmedAt`: Date | null

Hoặc dùng 1 field `confirmations: { customer: Date, helper: Date }` nếu muốn gọn.

### 2. Booking Controller — Thêm endpoint update status + confirm

Thêm các hàm:
- `confirmServiceCompletion(bookingId, userId, role)` — ghi thời gian confirm tùy role
- `updateBookingStatus(bookingId, status)` — authorize dựa trên role

### 3. Booking Router — Thêm routes

```js
// Customer confirms service done
router.put('/customer/:bookingId/confirm', verifyToken, authorize('customer'), ...)

// Helper confirms service done  
router.put('/helper/:bookingId/confirm', verifyToken, authorize('helper'), ...)
```

### 4. Payment Controller — Thêm validation trước khi redirect

Trong `createPayment`, thêm check:
- Nếu `customerConfirmedAt` và `helperConfirmedAt` đều có → cho phép tạo payment link
- Nếu thiếu 1 trong 2 → trả 400 với message rõ ràng

### 5. Redirect Flow

Sau khi `createPayment` thành công, trả về `checkoutUrl` như hiện tại. Frontend sẽ:
- Sau khi cả 2 confirm → hiển thị nút "Thanh toán" → redirect sang `checkoutUrl`

## Open Question

**Ai là người kích hoạt redirect sang PayOS?**

- **Option A (Recommended):** Customer tự nhấn nút "Thanh toán" sau khi thấy cả 2 đã confirm. Server chỉ validate điều kiện, quyết định redirect thuộc về frontend.
- **Option B:** Hệ thống tự redirect sau khi phát hiện cả 2 confirm. Cần thêm polling/websocket từ client → phức tạp hơn.

## Validation Plan

1. Tạo booking, helper confirm → thử createPayment → phải fail (thiếu customer confirm)
2. Customer confirm → thử createPayment → thành công, trả checkoutUrl
3. Test webhook PAID → booking.status = PAID, payment record tạo, corporate wallet cập nhật

## Out of Scope

- Không implement client-side UI (chỉ backend)
- Không implement helper/customer app pages
- Không thêm `@payos/payos-checkout` (chỉ dùng redirect)
