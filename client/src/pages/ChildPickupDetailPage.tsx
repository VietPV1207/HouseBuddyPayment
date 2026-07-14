import { useState } from "react";
import { Button } from "../components/ui/Button";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { formatCurrency } from "../utils/currency";
import type {
  ChildPickupDirection,
  ChildPickupPlan,
  ChildPickupSelections,
  ChildPickupVehicle,
  ServiceOption,
} from "../types/booking";

type ChildPickupDetailPageProps = {
  service: ServiceOption;
  onBack: () => void;
  onBook: (selections: ChildPickupSelections) => void;
};

const directions: ChildPickupDirection[] = ["Đưa", "Đón", "Cả hai"];
const vehicles: { value: ChildPickupVehicle; icon: string }[] = [
  { value: "Xe máy", icon: "moped" },
  { value: "Ô tô", icon: "directions_car" },
];
const plans: ChildPickupPlan[] = ["Dịch vụ lẻ", "Theo tuần", "Theo tháng"];

export function ChildPickupDetailPage({
  service,
  onBack,
  onBook,
}: ChildPickupDetailPageProps) {
  const [direction, setDirection] = useState<ChildPickupDirection>("Đưa");
  const [vehicle, setVehicle] = useState<ChildPickupVehicle>("Xe máy");
  const [childCount, setChildCount] = useState(1);
  const [plan, setPlan] = useState<ChildPickupPlan>("Dịch vụ lẻ");

  const chipClass = (active: boolean) =>
    `rounded-xl border px-md py-sm font-label-md text-label-md transition-all ${
      active
        ? "border-primary-container bg-primary-container text-white"
        : "border-outline-variant bg-surface-container-low text-on-surface-variant"
    }`;

  return (
    <div className="min-h-dvh bg-background pb-28 text-on-surface">
      <header className="fixed top-0 z-50 w-full bg-surface/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-tap-target-min w-full max-w-md items-center px-margin-mobile">
          <button
            type="button"
            onClick={onBack}
            aria-label="Quay lại"
            className="text-primary transition-transform active:scale-95"
          >
            <MaterialIcon name="arrow_back" />
          </button>
          <h1 className="ml-4 flex-1 font-title-md text-title-md text-on-surface">
            {service.category}
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md pt-tap-target-min">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={service.heroImage}
            alt={service.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="relative z-10 -mt-8 px-margin-mobile">
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0px_4px_20px_rgba(17,24,39,0.06)]">
            <div className="mb-sm flex items-start justify-between">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {service.name}
              </h2>
              <div className="flex items-center gap-1 rounded-lg bg-secondary-fixed/30 px-2 py-1">
                <MaterialIcon
                  name="star"
                  filled
                  className="text-sm text-secondary"
                />
                <span className="font-label-md text-on-secondary-fixed">
                  {service.rating}
                </span>
                <span className="text-label-sm text-on-surface-variant">
                  ({service.reviewCount}+)
                </span>
              </div>
            </div>
            <div className="mb-md font-headline-lg-mobile text-headline-lg-mobile text-primary">
              Từ {formatCurrency(service.basePrice)}
              <span className="font-normal text-label-md text-on-surface-variant">
                /{service.priceUnit}
              </span>
            </div>
            <div className="flex items-center gap-sm rounded-xl border border-primary-container/20 bg-primary-container/10 p-sm">
              <div className="flex items-center justify-center rounded-full bg-primary-container p-1 text-white">
                <MaterialIcon name="verified" filled className="text-sm" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-primary-container">
                  Đã xác minh
                </span>
                <p className="text-label-sm text-on-surface-variant">
                  Tài xế chuyên nghiệp, đã kiểm tra hồ sơ
                </p>
              </div>
            </div>
          </div>

          <section className="mt-lg">
            <h3 className="mb-md font-title-md text-title-md text-on-surface">
              Tùy chọn dịch vụ
            </h3>

            <div className="mb-lg">
              <span className="mb-sm block text-label-md text-on-surface-variant">
                Chiều đi
              </span>
              <div className="grid grid-cols-3 gap-sm">
                {directions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDirection(option)}
                    className={chipClass(direction === option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-lg grid grid-cols-2 gap-md">
              <div>
                <span className="mb-sm block text-label-md text-on-surface-variant">
                  Loại xe
                </span>
                <div className="flex flex-col gap-sm">
                  {vehicles.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setVehicle(option.value)}
                      className={`flex items-center gap-sm ${chipClass(vehicle === option.value)}`}
                    >
                      <MaterialIcon name={option.icon} className="text-md" />
                      <span>{option.value}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-sm block text-label-md text-on-surface-variant">
                  Số bé
                </span>
                <div className="flex h-full max-h-[88px] items-center justify-between rounded-xl border border-outline-variant bg-surface-container-low p-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setChildCount((count) => Math.max(1, count - 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-white transition-transform active:scale-90"
                  >
                    <MaterialIcon name="remove" className="text-sm" />
                  </button>
                  <span className="font-title-md text-on-surface">
                    {childCount}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setChildCount((count) => Math.min(3, count + 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-white transition-transform active:scale-90"
                  >
                    <MaterialIcon name="add" className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <span className="mb-sm block text-label-md text-on-surface-variant">
                Hình thức đặt
              </span>
              <div className="flex gap-sm overflow-x-auto pb-2">
                {plans.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPlan(option)}
                    className={`whitespace-nowrap ${chipClass(plan === option)}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-xl rounded-xl bg-surface-container-low p-md">
            <h3 className="mb-md font-title-md text-title-md text-on-surface">
              Dịch vụ bao gồm
            </h3>
            <ul className="space-y-md">
              {service.included.map((item) => (
                <li key={item} className="flex items-start gap-sm">
                  <MaterialIcon
                    name="check_circle"
                    className="mt-0.5 text-primary-container"
                  />
                  <span className="text-body-md text-on-surface">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-lg p-md">
            <h3 className="mb-md font-title-md text-title-md text-on-surface">
              Không bao gồm
            </h3>
            <ul className="space-y-md">
              {service.excluded.map((item) => (
                <li key={item} className="flex items-start gap-sm opacity-70">
                  <MaterialIcon name="cancel" className="mt-0.5 text-error" />
                  <span className="text-body-md text-on-surface">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/20 bg-surface px-margin-mobile py-4 shadow-[0_-4px_20px_rgba(17,24,39,0.06)]">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Từ
            </span>
            <span className="font-headline-lg text-headline-lg text-primary">
              {formatCurrency(service.basePrice)}/{service.priceUnit}
            </span>
          </div>
          <Button
            fullWidth={false}
            className="px-10"
            onClick={() => onBook({ direction, vehicle, childCount, plan })}
          >
            Đặt lịch ngay
          </Button>
        </div>
      </footer>
    </div>
  );
}
