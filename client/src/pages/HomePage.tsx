import { useEffect, useRef, useState } from "react";
import { BottomNav } from "../components/ui/BottomNav";
import type { BottomNavTab } from "../components/ui/BottomNav";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { getCustomerBookings } from "../services/bookingApi";
import { getCustomerProfile } from "../services/customerApi";
import { formatBookingStatus } from "../utils/bookingStatus";
import { formatCurrency } from "../utils/currency";
import { getServiceIcon } from "../utils/serviceIcon";
import type { ApiBooking, ServiceOption } from "../types/booking";
import type { AuthUser } from "../types/auth";

type HomePageProps = {
  user: AuthUser;
  services: ServiceOption[];
  onNavigate: (tab: BottomNavTab) => void;
  onSelectService: (serviceId: string) => void;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 14) return "Chào buổi trưa";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function HomePage({
  user,
  services,
  onNavigate,
  onSelectService,
}: HomePageProps) {
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("Hà Nội");
  const [lastBooking, setLastBooking] = useState<ApiBooking | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const serviceGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    getCustomerProfile(user._id)
      .then((profile) => {
        if (cancelled) return;
        setFullName(profile.fullName);
        const primaryAddress = profile.address[0];
        if (primaryAddress) {
          setLocation(
            [primaryAddress.district, primaryAddress.city]
              .filter(Boolean)
              .join(", ") || primaryAddress.city,
          );
        }
      })
      .catch(() => {
        // Non-critical: home still renders fine without a display name.
      });

    getCustomerBookings()
      .then((bookings) => {
        if (cancelled) return;
        setLastBooking(bookings[0] ?? null);
      })
      .catch(() => {
        // Non-critical: falls back to the empty state below.
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBooking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user._id]);

  return (
    <div className="min-h-dvh bg-background pb-24 text-on-surface">
      <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between bg-surface px-margin-mobile">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-primary-container bg-primary-container/10">
            <MaterialIcon name="person" className="text-primary" />
          </div>
          <div>
            <h1 className="font-title-md text-title-md leading-tight text-on-surface">
              {getGreeting()}
              {fullName ? `, ${fullName.split(" ").pop()}` : ""}
            </h1>
            <div className="flex items-center gap-1 text-on-surface-variant">
              <MaterialIcon name="location_on" className="text-[16px]" />
              <span className="text-label-sm font-label-sm">{location}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-variant"
          aria-label="Thông báo"
        >
          <MaterialIcon
            name="notifications"
            className="text-on-surface-variant"
          />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-surface bg-error" />
        </button>
      </header>

      <main className="space-y-6 pt-2">
        <section className="px-margin-mobile">
          <div className="relative flex h-32 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container" />
            <div className="relative flex h-full flex-col justify-center gap-1 px-6">
              <h3 className="font-bold text-body-lg text-on-primary">
                Nhận ngay 50k GPoint
              </h3>
              <p className="text-label-sm text-on-primary/80">
                Dành riêng cho thành viên mới
              </p>
              <button
                type="button"
                onClick={() => onNavigate("account")}
                className="mt-2 w-fit rounded-full bg-secondary-container px-4 py-1.5 font-bold text-label-sm text-on-secondary-container shadow-md"
              >
                Nhận ngay
              </button>
            </div>
          </div>
        </section>

        <section ref={serviceGridRef} className="scroll-mt-20 px-margin-mobile">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-title-md text-title-md text-on-surface">
              Dịch vụ phổ biến
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelectService(service.id)}
                className="group overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest text-left shadow-[0_4px_20px_rgba(17,24,39,0.06)] transition-transform active:scale-[0.97]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-high">
                  {service.heroImage ? (
                    <img
                      src={service.heroImage}
                      alt={service.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <MaterialIcon
                        name={getServiceIcon(service.category)}
                        className="text-4xl text-primary"
                      />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-label-md text-label-md text-on-surface">
                    {service.name}
                  </p>
                  <p className="mt-0.5 font-bold text-label-sm text-primary">
                    Từ {formatCurrency(service.basePrice)}/{service.priceUnit}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="px-margin-mobile">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-title-md text-title-md text-on-surface">
              Đơn gần đây
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("orders")}
              className="font-bold text-label-sm text-primary"
            >
              Xem tất cả
            </button>
          </div>

          {isLoadingBooking ? (
            <div className="h-24 animate-pulse rounded-2xl bg-surface-container-lowest" />
          ) : lastBooking ? (
            <div className="flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-[0_4px_20px_rgba(17,24,39,0.06)]">
              <div className="rounded-xl bg-primary-container/10 p-3">
                <MaterialIcon name="history" className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-bold text-body-md">
                  {lastBooking.serviceSnapshot?.name || "Dịch vụ HouseBuddy"}
                </h4>
                <p className="text-label-sm text-on-surface-variant">
                  {formatBookingStatus(lastBooking.status)} ·{" "}
                  {formatCurrency(lastBooking.totalAmount)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const matched = services.find(
                    (service) =>
                      service.name === lastBooking.serviceSnapshot?.name,
                  );
                  onSelectService(matched?.id || services[0].id);
                }}
                className="rounded-lg bg-primary p-1.5 text-on-primary transition-transform active:scale-90"
                aria-label="Đặt lại"
              >
                <MaterialIcon name="replay" className="text-[18px]" />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest p-6 text-center">
              <p className="text-body-md text-on-surface-variant">
                Bạn chưa có đơn nào. Đặt dịch vụ đầu tiên ngay hôm nay!
              </p>
              <button
                type="button"
                onClick={() =>
                  serviceGridRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="mt-3 font-bold text-label-md text-primary"
              >
                Chọn dịch vụ ở trên
              </button>
            </div>
          )}
        </section>
      </main>

      <BottomNav active="home" onChange={onNavigate} />
    </div>
  );
}
