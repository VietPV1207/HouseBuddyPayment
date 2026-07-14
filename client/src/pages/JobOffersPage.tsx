import { useEffect, useState } from "react";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { TopAppBar } from "../components/ui/TopAppBar";
import {
  acceptOffer,
  getHelperOffers,
  rejectOffer,
} from "../services/bookingApi";
import { formatCurrency } from "../utils/currency";
import { getServiceIcon } from "../utils/serviceIcon";
import type { ApiBooking } from "../types/booking";

type JobOffersPageProps = {
  onBack: () => void;
  onAccepted: (bookingId: string) => void;
};

function formatSchedule(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return `Hôm nay, ${time}`;
  return `${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}, ${time}`;
}

export function JobOffersPage({ onBack, onAccepted }: JobOffersPageProps) {
  const [offers, setOffers] = useState<ApiBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<
    Record<string, "accepting" | "rejecting">
  >({});
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);

  const loadOffers = () => {
    setIsLoading(true);
    getHelperOffers()
      .then(setOffers)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Không thể tải danh sách việc",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(loadOffers, []);

  const handleAccept = (bookingId: string) => {
    setPendingAction((current) => ({ ...current, [bookingId]: "accepting" }));
    acceptOffer(bookingId)
      .then(() => onAccepted(bookingId))
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Không thể nhận việc này",
        );
        setPendingAction((current) => {
          const next = { ...current };
          delete next[bookingId];
          return next;
        });
      });
  };

  const handleReject = (bookingId: string) => {
    setPendingAction((current) => ({ ...current, [bookingId]: "rejecting" }));
    rejectOffer(bookingId)
      .then(() => setRejectedIds((current) => [...current, bookingId]))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Không thể từ chối việc này",
        ),
      )
      .finally(() =>
        setPendingAction((current) => {
          const next = { ...current };
          delete next[bookingId];
          return next;
        }),
      );
  };

  const visibleOffers = offers.filter(
    (offer) => !rejectedIds.includes(offer._id),
  );

  return (
    <div className="min-h-dvh bg-background pb-10 text-on-surface">
      <TopAppBar title="Lời mời công việc" onBack={onBack} />

      <main className="mx-auto w-full max-w-md px-margin-mobile pt-lg">
        <section className="mb-lg">
          <div className="mb-sm flex items-center justify-between">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">
              Việc làm mới nhất
            </h2>
            <span className="rounded-full bg-primary-container/10 px-3 py-1 font-label-md text-label-md text-primary">
              {visibleOffers.length} tin
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Chọn các công việc phù hợp với lịch trình của bạn
          </p>
        </section>

        {error && (
          <p className="mb-4 rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-md">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-40 animate-pulse rounded-lg bg-surface-container-lowest"
              />
            ))}
          </div>
        ) : visibleOffers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <MaterialIcon name="inbox" className="text-4xl text-outline" />
            <p className="text-body-md text-on-surface-variant">
              Hiện chưa có lời mời công việc nào.
            </p>
          </div>
        ) : (
          <div className="space-y-md">
            {visibleOffers.map((offer) => {
              const isBusy = Boolean(pendingAction[offer._id]);
              return (
                <div
                  key={offer._id}
                  className="rounded-lg border border-[#F3F4F6] bg-white/80 p-md shadow-[0px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container/10 text-primary-container">
                        <MaterialIcon
                          name={getServiceIcon(offer.serviceSnapshot?.category)}
                          className="text-[32px]"
                        />
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md leading-tight text-on-surface">
                          {offer.serviceSnapshot?.name || "Dịch vụ HouseBuddy"}
                        </h3>
                        <div className="mt-1 flex items-center gap-1 text-on-surface-variant">
                          <MaterialIcon name="schedule" className="text-sm" />
                          <span>
                            {offer.duration} giờ •{" "}
                            {formatSchedule(offer.scheduledTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-primary-container">
                        {formatCurrency(offer.totalAmount)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Thù lao ước tính
                      </span>
                    </div>
                  </div>
                  <div className="mb-md flex items-center gap-2 text-on-surface-variant">
                    <MaterialIcon
                      name="location_on"
                      className="text-secondary"
                    />
                    <span>
                      {[
                        offer.address?.street,
                        offer.address?.district,
                        offer.address?.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleReject(offer._id)}
                      className="h-tap-target-min w-full rounded-full border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-50"
                    >
                      {pendingAction[offer._id] === "rejecting"
                        ? "Đang xử lý..."
                        : "Từ chối"}
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleAccept(offer._id)}
                      className="h-tap-target-min w-full rounded-full bg-primary-container font-bold text-on-primary shadow-md transition-transform hover:opacity-90 active:scale-95 disabled:opacity-50"
                    >
                      {pendingAction[offer._id] === "accepting"
                        ? "Đang nhận..."
                        : "Nhận việc ngay"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
