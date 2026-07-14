import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { formatCurrency } from "../utils/currency";
import type { ApiBooking } from "../types/booking";

type BookingSuccessPageProps = {
  booking: ApiBooking;
  onViewOrders: () => void;
  onGoHome: () => void;
};

const statusMessages = [
  "Đang kết nối người giúp việc...",
  "Kiểm tra lịch trình phù hợp...",
  "Xác nhận thông tin đơn hàng...",
  "Gần xong rồi...",
];

function formatSchedule(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingSuccessPage({
  booking,
  onViewOrders,
  onGoHome,
}: BookingSuccessPageProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((index) => (index + 1) % statusMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const orderCode = `#HB-${booking._id.slice(-6).toUpperCase()}`;
  const area =
    booking.address?.district || booking.address?.city || "khu vực của bạn";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between overflow-x-hidden bg-background">
      <main className="flex w-full max-w-md flex-1 flex-col items-center px-margin-mobile pt-16 text-center">
        <div className="relative mb-8">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary-container shadow-lg">
            <MaterialIcon
              name="check_circle"
              filled
              className="text-6xl text-on-primary"
            />
          </div>
          <div className="absolute -right-2 -top-2">
            <MaterialIcon
              name="auto_awesome"
              className="animate-bounce text-2xl text-secondary"
            />
          </div>
        </div>

        <div className="mb-10 space-y-2">
          <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary">
            Đặt đơn thành công!
          </h1>
          <p className="font-title-md text-title-md font-medium text-on-surface-variant">
            Mã đơn: {orderCode}
          </p>
        </div>

        <div className="mb-12 flex w-full flex-col items-center space-y-6 rounded-xl border border-outline-variant/20 bg-white/80 p-lg shadow-sm backdrop-blur-sm">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-container opacity-30" />
            <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary-container">
              <MaterialIcon name="search" className="animate-spin text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-body-lg text-body-lg font-semibold text-on-surface">
              {statusMessages[statusIndex]}
            </p>
            <p className="mx-auto max-w-[280px] font-body-md text-body-md text-on-surface-variant">
              Chúng tôi đang tìm người giúp việc phù hợp tại{" "}
              <span className="font-bold text-primary">{area}</span>
            </p>
          </div>
        </div>

        <div className="mb-12 grid w-full grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-md shadow-sm">
            <MaterialIcon name="calendar_today" className="text-primary" />
            <div className="text-left">
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Lịch hẹn
              </p>
              <p className="font-label-md text-label-md">
                {formatSchedule(booking.scheduledTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-md shadow-sm">
            <MaterialIcon name="payments" className="text-primary" />
            <div className="text-left">
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Tổng tiền
              </p>
              <p className="font-label-md text-label-md">
                {formatCurrency(booking.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 w-full max-w-md bg-gradient-to-t from-background via-background to-transparent px-margin-mobile pb-12 pt-6">
        <div className="flex flex-col gap-4">
          <Button onClick={onViewOrders}>Xem đơn của tôi</Button>
          <Button variant="secondary" onClick={onGoHome}>
            Về trang chủ
          </Button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </footer>
    </div>
  );
}
