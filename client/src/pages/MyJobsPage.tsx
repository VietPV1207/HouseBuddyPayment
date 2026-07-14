import { useEffect, useMemo, useState } from "react";
import { HelperBottomNav } from "../components/ui/HelperBottomNav";
import type { HelperNavTab } from "../components/ui/HelperBottomNav";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { getHelperJobs } from "../services/bookingApi";
import { getBookingStatusMeta } from "../utils/bookingStatus";
import { formatCurrency } from "../utils/currency";
import { getServiceIcon } from "../utils/serviceIcon";
import type { ApiBooking } from "../types/booking";
import type { BookingStatusTone } from "../utils/bookingStatus";

type MyJobsPageProps = {
  scope: "schedule" | "jobs";
  onNavigate: (tab: HelperNavTab) => void;
  onOpenJob: (bookingId: string) => void;
};

const toneBadgeClasses: Record<BookingStatusTone, string> = {
  primary: "bg-primary-container/15 text-primary",
  warning: "bg-secondary-container/20 text-secondary",
  neutral: "bg-surface-container-high text-on-surface-variant",
  error: "bg-error-container/50 text-on-error-container",
};

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

export function MyJobsPage({ scope, onNavigate, onOpenJob }: MyJobsPageProps) {
  const [jobs, setJobs] = useState<ApiBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getHelperJobs()
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Không thể tải danh sách đơn",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleJobs = useMemo(() => {
    const sorted = [...jobs].sort(
      (a, b) =>
        new Date(b.scheduledTime).getTime() -
        new Date(a.scheduledTime).getTime(),
    );
    if (scope === "schedule") {
      return sorted.filter(
        (job) => job.status === "CONFIRMED" || job.status === "IN_PROGRESS",
      );
    }
    return sorted;
  }, [jobs, scope]);

  const title = scope === "schedule" ? "Lịch làm việc" : "Đơn của tôi";
  const activeTab: HelperNavTab = scope === "schedule" ? "schedule" : "jobs";
  const emptyText =
    scope === "schedule"
      ? "Bạn chưa có lịch làm việc sắp tới."
      : "Bạn chưa có đơn nào.";

  return (
    <div className="min-h-dvh bg-background pb-28 text-on-surface">
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-center bg-surface px-margin-mobile shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
          {title}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md px-margin-mobile pt-lg">
        {error && (
          <p className="mb-4 rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-28 animate-pulse rounded-2xl bg-surface-container-lowest"
              />
            ))}
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <MaterialIcon name="assignment" className="text-4xl text-outline" />
            <p className="text-body-md text-on-surface-variant">{emptyText}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleJobs.map((job) => {
              const statusMeta = getBookingStatusMeta(job.status);
              return (
                <button
                  key={job._id}
                  type="button"
                  onClick={() => onOpenJob(job._id)}
                  className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 text-left shadow-[0_4px_20px_rgba(17,24,39,0.06)]"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high">
                        <MaterialIcon
                          name={getServiceIcon(job.serviceSnapshot?.category)}
                          className="text-primary"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-body-md text-on-surface">
                          {job.serviceSnapshot?.name || "Dịch vụ HouseBuddy"}
                        </h3>
                        <p className="text-label-sm text-on-surface-variant">
                          {job.customerName || "Khách hàng"} ·{" "}
                          {formatSchedule(job.scheduledTime)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 font-label-sm text-label-sm font-bold ${toneBadgeClasses[statusMeta.tone]}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2">
                    <span className="text-label-sm text-on-surface-variant">
                      {[job.address?.district, job.address?.city]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                    <span className="font-bold text-primary">
                      {formatCurrency(job.totalAmount)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <HelperBottomNav active={activeTab} onChange={onNavigate} />
    </div>
  );
}
