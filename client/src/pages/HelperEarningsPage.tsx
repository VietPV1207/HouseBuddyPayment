import { useEffect, useMemo, useState } from "react";
import { HelperBottomNav } from "../components/ui/HelperBottomNav";
import type { HelperNavTab } from "../components/ui/HelperBottomNav";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { getHelperJobs } from "../services/bookingApi";
import { formatCurrency } from "../utils/currency";
import { getServiceIcon } from "../utils/serviceIcon";
import type { ApiBooking } from "../types/booking";

type HelperEarningsPageProps = {
  onNavigate: (tab: HelperNavTab) => void;
};

function isSameWeek(date: Date, reference: Date) {
  const start = new Date(reference);
  start.setDate(reference.getDate() - reference.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function HelperEarningsPage({ onNavigate }: HelperEarningsPageProps) {
  const [jobs, setJobs] = useState<ApiBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHelperJobs()
      .then(setJobs)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không thể tải thu nhập"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const completedJobs = useMemo(
    () =>
      jobs
        .filter((job) => job.status === "COMPLETED")
        .sort(
          (a, b) =>
            new Date(b.scheduledTime).getTime() -
            new Date(a.scheduledTime).getTime(),
        ),
    [jobs],
  );

  const totalEarnings = useMemo(
    () => completedJobs.reduce((sum, job) => sum + job.totalAmount, 0),
    [completedJobs],
  );

  const weeklyEarnings = useMemo(() => {
    const now = new Date();
    return completedJobs
      .filter((job) => isSameWeek(new Date(job.scheduledTime), now))
      .reduce((sum, job) => sum + job.totalAmount, 0);
  }, [completedJobs]);

  return (
    <div className="min-h-dvh bg-background pb-28 text-on-surface">
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-center bg-surface px-margin-mobile shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
          Thu nhập
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md px-margin-mobile pt-lg">
        {error && (
          <p className="mb-4 rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
            {error}
          </p>
        )}

        <section className="mb-lg rounded-xl bg-primary p-lg text-on-primary shadow-[0px_4px_12px_rgba(0,0,0,0.1)]">
          <p className="mb-1 font-label-md text-label-md uppercase opacity-80">
            Tổng thu nhập tích lũy
          </p>
          <h2 className="mb-md text-[32px] font-bold">
            {formatCurrency(totalEarnings)}
          </h2>
          <div className="rounded-lg bg-white/15 p-sm backdrop-blur-sm">
            <p className="text-[10px] opacity-70">Tuần này</p>
            <p className="font-bold text-body-lg">
              {formatCurrency(weeklyEarnings)}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-md font-headline-lg-mobile text-headline-lg-mobile">
            Lịch sử công việc đã hoàn thành
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((key) => (
                <div
                  key={key}
                  className="h-20 animate-pulse rounded-xl bg-surface-container-lowest"
                />
              ))}
            </div>
          ) : completedJobs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <MaterialIcon name="payments" className="text-4xl text-outline" />
              <p className="text-body-md text-on-surface-variant">
                Bạn chưa có công việc nào hoàn thành.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedJobs.map((job) => (
                <div
                  key={job._id}
                  className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high">
                      <MaterialIcon
                        name={getServiceIcon(job.serviceSnapshot?.category)}
                        className="text-primary"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-body-md">
                        {job.serviceSnapshot?.name || "Dịch vụ HouseBuddy"}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {job.customerName || "Khách hàng"} ·{" "}
                        {formatDate(job.scheduledTime)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-primary">
                    +{formatCurrency(job.totalAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <HelperBottomNav active="earnings" onChange={onNavigate} />
    </div>
  );
}
