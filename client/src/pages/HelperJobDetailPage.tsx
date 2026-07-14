import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { TopAppBar } from "../components/ui/TopAppBar";
import { getHelperJobs, startJob } from "../services/bookingApi";
import { formatCurrency } from "../utils/currency";
import { getServiceIcon } from "../utils/serviceIcon";
import type { ApiBooking } from "../types/booking";

type HelperJobDetailPageProps = {
  bookingId: string;
  onBack: () => void;
  onOpenComplete: (booking: ApiBooking) => void;
};

const steps = [
  {
    key: "matched",
    label: "Đã ghép",
    statuses: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"],
  },
  {
    key: "in-progress",
    label: "Thực hiện",
    statuses: ["IN_PROGRESS", "COMPLETED"],
  },
  { key: "payment", label: "Chờ thanh toán", statuses: ["COMPLETED"] },
  { key: "done", label: "Hoàn tất", statuses: [] as string[] },
];

function formatSchedule(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HelperJobDetailPage({
  bookingId,
  onBack,
  onOpenComplete,
}: HelperJobDetailPageProps) {
  const [job, setJob] = useState<ApiBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getHelperJobs()
      .then((jobs) => {
        if (cancelled) return;
        const found = jobs.find((item) => item._id === bookingId);
        if (found) setJob(found);
        else setError("Không tìm thấy đơn hàng này");
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Không thể tải chi tiết đơn",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const handleStart = () => {
    if (!job) return;
    setIsStarting(true);
    startJob(job._id)
      .then((data) => setJob(data.booking))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Không thể bắt đầu công việc",
        ),
      )
      .finally(() => setIsStarting(false));
  };

  const orderCode = job ? `#HB-${job._id.slice(-6).toUpperCase()}` : "";
  const activeStepIndex = job
    ? steps.findIndex((step) => !step.statuses.includes(job.status)) - 1
    : -1;

  return (
    <div className="min-h-dvh bg-background pb-10 text-on-surface">
      <TopAppBar title="Chi tiết đơn" onBack={onBack} />

      <main className="mx-auto w-full max-w-md space-y-4 px-margin-mobile pt-4">
        {error && (
          <p className="rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-24 animate-pulse rounded-xl bg-surface-container-lowest"
              />
            ))}
          </div>
        ) : job ? (
          <>
            <section className="rounded-xl border border-[#F3F4F6] bg-white/80 p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Mã đơn hàng
                </span>
                <span className="font-headline-md text-headline-md text-on-surface">
                  {orderCode}
                </span>
              </div>
              <div className="flex items-center justify-between px-2">
                {steps.map((step, index) => (
                  <div
                    key={step.key}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`h-4 w-4 rounded-full ${
                        index <= activeStepIndex
                          ? "bg-primary ring-4 ring-primary/20"
                          : "bg-surface-variant"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-semibold ${index <= activeStepIndex ? "text-primary" : "text-outline"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex items-center justify-between rounded-xl border border-[#F3F4F6] bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
                  <MaterialIcon
                    name="person"
                    className="text-2xl text-on-surface-variant"
                  />
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {job.customerName || "Khách hàng"}
                  </h3>
                  {job.customerPhone && (
                    <p className="text-body-md text-on-surface-variant">
                      {job.customerPhone}
                    </p>
                  )}
                </div>
              </div>
              {job.customerPhone && (
                <a
                  href={`tel:${job.customerPhone}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-white transition-transform active:scale-95"
                  aria-label="Gọi khách hàng"
                >
                  <MaterialIcon name="call" />
                </a>
              )}
            </section>

            <section className="space-y-4 rounded-xl border border-[#F3F4F6] bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-surface-container p-2">
                  <MaterialIcon
                    name={getServiceIcon(job.serviceSnapshot?.category)}
                    className="text-primary"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-body-lg text-on-surface">
                    {job.serviceSnapshot?.name || "Dịch vụ HouseBuddy"}
                  </h4>
                  <p className="text-body-md text-on-surface-variant">
                    Thời lượng: {job.duration} giờ •{" "}
                    {formatSchedule(job.scheduledTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t border-surface-variant pt-2">
                <div className="rounded-lg bg-surface-container p-2">
                  <MaterialIcon name="location_on" className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-body-lg text-on-surface">
                    {[
                      job.address?.street,
                      job.address?.district,
                      job.address?.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </h4>
                </div>
              </div>
            </section>

            {job.note && (
              <section className="rounded-r-xl border-l-4 border-primary bg-surface-container-low p-4">
                <h4 className="mb-1 font-label-md text-label-md uppercase tracking-wider text-primary">
                  Ghi chú
                </h4>
                <p className="italic text-body-md text-on-surface-variant">
                  "{job.note}"
                </p>
              </section>
            )}

            <section className="rounded-xl border border-[#F3F4F6] bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
              <h4 className="mb-2 font-bold text-body-lg text-on-surface">
                Chi tiết thu nhập
              </h4>
              <div className="flex justify-between border-t border-surface-variant pt-2 font-bold text-primary">
                <span>Tổng cộng</span>
                <span>{formatCurrency(job.totalAmount)}</span>
              </div>
            </section>

            <section className="pb-6 pt-2 text-center">
              {job.status === "CONFIRMED" && (
                <Button onClick={handleStart} disabled={isStarting}>
                  {isStarting ? "Đang bắt đầu..." : "Bắt đầu công việc"}
                </Button>
              )}
              {job.status === "IN_PROGRESS" && (
                <Button onClick={() => onOpenComplete(job)}>
                  Xác nhận hoàn thành
                </Button>
              )}
              {job.status === "COMPLETED" && (
                <p className="font-label-md text-label-md text-on-surface-variant">
                  Đơn đã hoàn thành. Đang chờ khách hàng thanh toán.
                </p>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
