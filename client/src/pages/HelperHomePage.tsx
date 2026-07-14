import { useEffect, useMemo, useState } from "react";
import { HelperBottomNav } from "../components/ui/HelperBottomNav";
import type { HelperNavTab } from "../components/ui/HelperBottomNav";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { getHelperJobs, getHelperOffers } from "../services/bookingApi";
import {
  getHelperProfile,
  updateHelperWorkStatus,
} from "../services/helperApi";
import { formatCurrency } from "../utils/currency";
import { getServiceIcon } from "../utils/serviceIcon";
import type { ApiBooking } from "../types/booking";
import type { AuthUser } from "../types/auth";

type HelperHomePageProps = {
  user: AuthUser;
  onNavigate: (tab: HelperNavTab) => void;
  onOpenOffers: () => void;
  onOpenJob: (bookingId: string) => void;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTimeRange(scheduledTime: string, durationHours: number) {
  const start = new Date(scheduledTime);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)} - ${fmt(end)}`;
}

export function HelperHomePage({
  user,
  onNavigate,
  onOpenOffers,
  onOpenJob,
}: HelperHomePageProps) {
  const [fullName, setFullName] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [offerCount, setOfferCount] = useState(0);
  const [jobs, setJobs] = useState<ApiBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getHelperProfile(user._id)
      .then((profile) => {
        setFullName(profile.fullName || "");
        setIsOnline(profile.workStatus !== "offline");
      })
      .catch(() => {
        // Non-critical: greeting falls back to no name.
      });

    Promise.all([getHelperOffers(), getHelperJobs()])
      .then(([offers, allJobs]) => {
        setOfferCount(offers.length);
        setJobs(allJobs);
      })
      .catch(() => {
        // Non-critical: sections just render empty.
      })
      .finally(() => setIsLoading(false));
  }, [user._id]);

  const todayJobs = useMemo(() => {
    const today = new Date();
    return jobs
      .filter((job) => isSameDay(new Date(job.scheduledTime), today))
      .filter(
        (job) => job.status === "CONFIRMED" || job.status === "IN_PROGRESS",
      );
  }, [jobs]);

  const todayEarnings = useMemo(() => {
    const today = new Date();
    return jobs
      .filter(
        (job) =>
          job.status === "COMPLETED" &&
          isSameDay(new Date(job.scheduledTime), today),
      )
      .reduce((sum, job) => sum + job.totalAmount, 0);
  }, [jobs]);

  const completedCount = useMemo(
    () => jobs.filter((job) => job.status === "COMPLETED").length,
    [jobs],
  );

  const handleToggleStatus = () => {
    const next = !isOnline;
    setIsOnline(next);
    setIsTogglingStatus(true);
    updateHelperWorkStatus(user._id, next ? "available" : "offline")
      .catch(() => setIsOnline(!next))
      .finally(() => setIsTogglingStatus(false));
  };

  return (
    <div className="min-h-dvh bg-background pb-28 text-on-surface">
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between bg-surface px-margin-mobile shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <MaterialIcon name="location_on" className="text-primary" />
          <span className="text-[16px] font-bold text-primary">Hà Nội</span>
        </div>
        <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
          HouseBuddy
        </span>
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-low"
        >
          <MaterialIcon
            name="notifications"
            className="text-on-surface-variant"
          />
        </button>
      </header>

      <main className="mx-auto w-full max-w-md px-margin-mobile pt-lg">
        <div className="mb-lg flex items-start justify-between">
          <div>
            <h1 className="mb-1 font-headline-lg-mobile text-headline-lg-mobile">
              Chào {fullName || "bạn"}
            </h1>
            <p className="font-body-md text-on-surface-variant">
              Chúc bạn một ngày làm việc vui vẻ!
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
            >
              <span
                className={`absolute inset-0 rounded-full transition-colors ${
                  isOnline ? "bg-primary-container" : "bg-outline-variant"
                }`}
              />
              <span
                className={`relative h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  isOnline ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`font-label-md text-label-md font-bold ${isOnline ? "text-primary" : "text-on-surface-variant"}`}
            >
              {isOnline ? "Đang nhận việc" : "Tạm nghỉ"}
            </span>
          </div>
        </div>

        <div className="mb-lg grid grid-cols-2 gap-gutter">
          <div className="relative col-span-2 overflow-hidden rounded-xl bg-primary p-lg text-on-primary shadow-[0px_4px_12px_rgba(0,0,0,0.1)]">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <p className="mb-1 font-label-md text-label-md uppercase opacity-80">
              Thu nhập hôm nay
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-[32px] font-bold">
                {formatCurrency(todayEarnings)}
              </h2>
            </div>
            <div className="mt-md flex gap-4">
              <div className="flex-1 rounded-lg bg-white/15 p-sm backdrop-blur-sm">
                <p className="text-[10px] opacity-70">Số ca hoàn thành</p>
                <p className="font-bold text-body-lg">{completedCount} ca</p>
              </div>
              <div className="flex-1 rounded-lg bg-white/15 p-sm backdrop-blur-sm">
                <p className="text-[10px] opacity-70">Trạng thái</p>
                <p className="flex items-center gap-1 font-bold text-body-lg">
                  {isOnline ? "Sẵn sàng" : "Tạm nghỉ"}
                </p>
              </div>
            </div>
          </div>

          {offerCount > 0 && (
            <button
              type="button"
              onClick={onOpenOffers}
              className="col-span-2 flex items-center justify-between rounded-xl border border-secondary-container/20 bg-secondary-container/10 p-md shadow-sm transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                  <MaterialIcon name="mail" filled />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-body-lg text-on-secondary-container">
                    {offerCount} lời mời mới
                  </h3>
                  <p className="font-body-md text-on-surface-variant">
                    Phản hồi ngay để nhận việc
                  </p>
                </div>
              </div>
              <MaterialIcon
                name="chevron_right"
                className="text-on-secondary-container"
              />
            </button>
          )}
        </div>

        <section className="mb-lg">
          <div className="mb-md flex items-center justify-between">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">
              Việc hôm nay
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("schedule")}
              className="font-bold text-label-md text-primary hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1].map((key) => (
                <div
                  key={key}
                  className="h-24 animate-pulse rounded-xl bg-surface-container-lowest"
                />
              ))}
            </div>
          ) : todayJobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-lowest p-lg text-center">
              <p className="text-body-md text-on-surface-variant">
                Bạn chưa có việc nào hôm nay.
              </p>
            </div>
          ) : (
            <div className="space-y-md">
              {todayJobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-[0px_4px_12px_rgba(0,0,0,0.05)]"
                >
                  <div className="mb-sm flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${job.status === "IN_PROGRESS" ? "animate-pulse bg-primary" : "bg-outline-variant"}`}
                      />
                      <span className="font-bold text-body-lg">
                        {formatTimeRange(job.scheduledTime, job.duration)}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 font-label-md text-label-md ${
                        job.status === "IN_PROGRESS"
                          ? "bg-primary-container/20 text-on-primary-container"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {job.status === "IN_PROGRESS"
                        ? "Đang diễn ra"
                        : "Sắp tới"}
                    </span>
                  </div>
                  <div className="mb-md flex items-center gap-md">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high">
                      <MaterialIcon
                        name={getServiceIcon(job.serviceSnapshot?.category)}
                        className="text-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-body-md">
                        {job.serviceSnapshot?.name || "Dịch vụ HouseBuddy"}
                      </p>
                      <p className="flex items-center gap-1 text-on-surface-variant">
                        <MaterialIcon
                          name="location_on"
                          className="text-[16px]"
                        />
                        {[job.address?.district, job.address?.city]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <p className="font-bold text-primary">
                      {formatCurrency(job.totalAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenJob(job._id)}
                    className="w-full rounded-lg bg-primary py-2 font-bold text-body-md text-on-primary shadow-sm active:opacity-90"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <HelperBottomNav active="home" onChange={onNavigate} />
    </div>
  );
}
