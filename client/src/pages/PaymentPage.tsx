import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { TopAppBar } from "../components/ui/TopAppBar";
import { payBooking } from "../services/bookingApi";
import { formatCurrency } from "../utils/currency";
import type { ApiBooking } from "../types/booking";

type PaymentPageProps = {
  booking: ApiBooking;
  onBack: () => void;
  onPaid: (booking: ApiBooking) => void;
};

const GRID = 21;

function useMockQr(seed: string) {
  return useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const isFinder = (r: number, c: number) => {
      const inBox = (br: number, bc: number) =>
        r >= br && r < br + 7 && c >= bc && c < bc + 7;
      return inBox(0, 0) || inBox(0, GRID - 7) || inBox(GRID - 7, 0);
    };
    const finderFilled = (r: number, c: number) => {
      const local = (br: number, bc: number) => {
        const lr = r - br;
        const lc = c - bc;
        if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
        return lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
      };
      if (r < 7 && c < 7) return local(0, 0);
      if (r < 7 && c >= GRID - 7) return local(0, GRID - 7);
      return local(GRID - 7, 0);
    };
    const cells: boolean[] = [];
    for (let r = 0; r < GRID; r += 1) {
      for (let c = 0; c < GRID; c += 1) {
        if (isFinder(r, c)) {
          cells.push(finderFilled(r, c));
        } else {
          hash = (hash * 1103515245 + 12345) >>> 0;
          cells.push(((hash >> (r % 16)) ^ (c * 7)) % 3 === 0);
        }
      }
    }
    return cells;
  }, [seed]);
}

export function PaymentPage({ booking, onBack, onPaid }: PaymentPageProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const cells = useMockQr(booking._id);
  const orderCode = `#HB-${booking._id.slice(-6).toUpperCase()}`;

  const handlePay = () => {
    setIsPaying(true);
    setError("");
    payBooking(booking._id)
      .then((data) => onPaid(data.booking))
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Không thể xác nhận thanh toán.",
        );
        setIsPaying(false);
      });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background text-on-surface">
      <TopAppBar title="Thanh toán QR" onBack={onBack} centered />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-margin-mobile pt-lg">
        <div className="mb-2 flex items-center gap-2">
          <MaterialIcon name="qr_code_2" className="text-primary" />
          <span className="font-title-md text-title-md text-primary">
            PayOS
          </span>
        </div>
        <p className="mb-6 text-center font-body-md text-body-md text-on-surface-variant">
          Quét mã bằng ứng dụng ngân hàng để thanh toán đơn {orderCode}
        </p>

        <div className="rounded-3xl border border-outline-variant/30 bg-white p-5 shadow-[0px_4px_20px_rgba(17,24,39,0.08)]">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${GRID}, 1fr)`,
              width: 220,
              height: 220,
            }}
          >
            {cells.map((filled, index) => (
              <div
                key={index}
                className={filled ? "bg-[#151c27]" : "bg-white"}
                style={{ aspectRatio: "1 / 1" }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 w-full space-y-2 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-body-md text-body-md text-on-surface-variant">
              Số tiền
            </span>
            <span className="font-bold text-title-md text-primary">
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-surface-variant pt-2">
            <span className="font-body-md text-body-md text-on-surface-variant">
              Nội dung
            </span>
            <span className="font-label-md text-label-md text-on-surface">
              HOUSEBUDDY {orderCode}
            </span>
          </div>
        </div>

        {error && (
          <p className="mt-4 w-full rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-container/10 p-3">
          <MaterialIcon name="info" className="text-primary" />
          <p className="font-label-sm text-label-sm text-on-primary-container">
            Môi trường thử nghiệm: nhấn nút bên dưới để mô phỏng thanh toán
            thành công.
          </p>
        </div>
      </main>

      <footer className="sticky bottom-0 w-full max-w-md self-center px-margin-mobile pb-[calc(24px+env(safe-area-inset-bottom))] pt-4">
        <Button onClick={handlePay} disabled={isPaying}>
          {isPaying ? "Đang xác nhận..." : "Tôi đã thanh toán"}
        </Button>
      </footer>
    </div>
  );
}
