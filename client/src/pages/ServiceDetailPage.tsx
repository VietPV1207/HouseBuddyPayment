import { useState } from "react";
import { Button } from "../components/ui/Button";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { formatCurrency } from "../utils/currency";
import type { ServiceOption } from "../types/booking";

type ServiceDetailPageProps = {
  service: ServiceOption;
  onBack: () => void;
  onBook: (serviceId: string, addOnIds: string[]) => void;
};

export function ServiceDetailPage({
  service,
  onBack,
  onBook,
}: ServiceDetailPageProps) {
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const addOnsTotal = service.addOns
    .filter((addOn) => selectedAddOnIds.includes(addOn.id))
    .reduce((sum, addOn) => sum + addOn.price, 0);
  const total = service.basePrice + addOnsTotal;

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

      <main className="mx-auto w-full max-w-md pt-[44px]">
        <section className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={service.heroImage}
            alt={service.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-margin-mobile">
            <div className="flex items-center gap-2 text-white">
              <span className="flex items-center rounded-lg bg-secondary-container px-2 py-1 font-label-md text-label-sm text-on-secondary-container">
                <MaterialIcon name="star" filled className="mr-1 text-[14px]" />
                {service.rating}
              </span>
              <span className="text-label-sm text-white/90">
                (
                {service.reviewCount >= 1000
                  ? `${Math.round(service.reviewCount / 100) / 10}k`
                  : `${service.reviewCount}+`}{" "}
                đánh giá)
              </span>
            </div>
            <div className="mt-2 font-headline-lg-mobile text-headline-lg-mobile text-white">
              {service.name}
            </div>
            <div className="font-title-md text-title-md text-white">
              Từ {formatCurrency(service.basePrice)}/{service.priceUnit}
            </div>
          </div>
        </section>

        <div className="space-y-xl px-margin-mobile pt-lg">
          <section>
            <h2 className="mb-md font-title-md text-title-md text-on-surface">
              Công việc bao gồm
            </h2>
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(17,24,39,0.06)]">
              <ul className="space-y-md">
                {service.included.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <MaterialIcon
                      name="check_circle"
                      filled
                      className="text-primary-container"
                    />
                    <span className="font-body-md text-body-md text-on-surface">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-md font-title-md text-title-md text-on-surface">
              Không bao gồm
            </h2>
            <div className="rounded-xl border-l-4 border-error/50 bg-surface-container-low/50 p-md">
              <ul className="space-y-md">
                {service.excluded.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <MaterialIcon name="info" className="text-error" />
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {service.addOns.length > 0 && (
            <section>
              <h2 className="mb-md font-title-md text-title-md text-on-surface">
                Dịch vụ thêm
              </h2>
              <div className="space-y-md">
                {service.addOns.map((addOn) => {
                  const active = selectedAddOnIds.includes(addOn.id);
                  return (
                    <div
                      key={addOn.id}
                      className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-primary">
                          <MaterialIcon name={addOn.icon} />
                        </div>
                        <div>
                          <div className="font-label-md text-label-md">
                            {addOn.name}
                          </div>
                          <div className="font-label-sm text-primary">
                            +{formatCurrency(addOn.price)}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAddOn(addOn.id)}
                        className={`rounded-full border-[1.5px] px-4 py-1.5 font-label-md text-label-md transition-all active:scale-95 ${
                          active
                            ? "border-transparent bg-primary-container text-on-primary-container"
                            : "border-primary text-primary"
                        }`}
                      >
                        {active ? "Bỏ" : "Thêm"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border-t border-outline-variant/20 bg-surface-container-lowest px-margin-mobile py-4 shadow-[0_-4px_20px_rgba(17,24,39,0.06)]">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Tổng cộng
            </span>
            <span className="font-headline-lg text-headline-lg text-primary">
              {formatCurrency(total)}
            </span>
          </div>
          <Button
            fullWidth={false}
            className="px-10"
            onClick={() => onBook(service.id, selectedAddOnIds)}
          >
            Đặt ngay
          </Button>
        </div>
      </footer>
    </div>
  );
}
