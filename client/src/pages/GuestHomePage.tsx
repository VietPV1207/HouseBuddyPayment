import { MaterialIcon } from "../components/ui/MaterialIcon";
import { formatCurrency } from "../utils/currency";
import type { ServiceOption } from "../types/booking";

type GuestHomePageProps = {
  services: ServiceOption[];
  onSelectService: (serviceId: string) => void;
  onLogin: () => void;
  onRegister: () => void;
};

const steps = [
  {
    icon: "touch_app",
    title: "1. Chọn dịch vụ",
    description: "Dọn dẹp, nấu ăn hoặc đưa đón",
  },
  {
    icon: "calendar_month",
    title: "2. Đặt lịch",
    description: "Chọn thời gian phù hợp với bạn",
  },
  {
    icon: "home_pin",
    title: "3. Đến làm việc",
    description: "Người giúp việc đến đúng giờ",
  },
  {
    icon: "qr_code_2",
    title: "4. Thanh toán",
    description: "Quét mã QR sau khi hoàn thành",
  },
];

const reviews = [
  {
    name: "Cô Hồng",
    stars: 5,
    quote: "Cô Hồng nấu ăn rất ngon, đúng vị gia đình. Rất sạch sẽ và chu đáo.",
    author: "— Chị Lan, Quận 1",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCBwNuOsAjIypJgu8VN1dEH5X15lM4TBb0crqpdrODaz-X8V6FxB84h1O-VV0_9qa5LnO_xWN_OI5D8bG08Tj_O9Oa6syfrgAKWxmjtShyzLjTBja2hsttkAQC2CKA5x3LKgmdjgmhRevyUa2KrxFGIDFdo8D_FmOkgVQmB6p7FSLGK60wcJDOb21I7yA-iomKYu-4Unsbn5tpZIWW_36xYmnzMio2vYitJraxOIwaSnfNhuS76jDv9",
  },
  {
    name: "Minh Tú",
    stars: 4,
    quote:
      "Bạn Tú làm việc rất nhanh nhẹn, dọn dẹp các ngóc ngách rất kỹ càng.",
    author: "— Anh Nam, Hoàn Kiếm",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqyqPVvD8ovK5AdiVo2-b9kLQKHgENMemcI1PBfVClN3L3fsv3ybdbIhDYBwbzvZO_x3f3qa4ZdrDSAJuvMAjbH3pHUtQ3rhf2U8e6QIcYrduYZDY3NNn94F7OKWGG9b3PKUr59TIP4N-OS5H7rxtDsFvkC7vfqKx_rDCtI3zijbGDTmjv7qgITjwR1Euv40qq5R5IvuLd5yui4Fsek-QuuzUei7polLPgIau5JhXNVlBNTwHGQ4pg",
  },
];

export function GuestHomePage({
  services,
  onSelectService,
  onLogin,
  onRegister,
}: GuestHomePageProps) {
  return (
    <div className="min-h-dvh bg-background pb-28 text-on-surface">
      <header className="sticky top-0 z-50 flex h-tap-target-min w-full items-center justify-between bg-surface px-margin-mobile shadow-sm">
        <div className="flex items-center gap-2">
          <MaterialIcon
            name="home_repair_service"
            className="text-[28px] text-primary"
          />
          <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
            HouseBuddy
          </span>
        </div>
        <button
          type="button"
          onClick={onLogin}
          className="font-bold text-label-md text-primary transition-transform active:scale-95"
        >
          Đăng nhập
        </button>
      </header>

      <main>
        <section className="relative overflow-hidden px-margin-mobile pb-lg pt-xl">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="mb-md inline-flex items-center gap-1 rounded-full bg-primary/10 px-md py-xs">
            <MaterialIcon
              name="location_on"
              className="text-[16px] text-primary"
            />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
              Hà Nội / TP. HCM
            </span>
          </div>
          <h1 className="mb-md font-headline-xl text-headline-xl text-on-surface">
            Giúp việc nhà theo giờ, nhanh và tin cậy
          </h1>
          <p className="mb-xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
            Giải pháp dọn dẹp, nấu ăn và đưa đón trẻ chuyên nghiệp cho gia đình
            bận rộn.
          </p>
          <button
            type="button"
            onClick={onRegister}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-primary-container font-bold text-title-md text-on-primary shadow-lg shadow-primary/20 transition-transform active:scale-[0.96]"
          >
            Bắt đầu ngay
            <MaterialIcon name="arrow_forward" />
          </button>
        </section>

        <section className="mb-xl">
          <div className="mb-md flex items-end justify-between px-margin-mobile">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">
              Dịch vụ của chúng tôi
            </h2>
          </div>
          <div className="flex gap-md overflow-x-auto px-margin-mobile pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelectService(service.id)}
                className="w-[240px] shrink-0 overflow-hidden rounded-xl bg-surface-container-lowest text-left shadow-[0_4px_20px_rgba(17,24,39,0.06)] transition-transform active:scale-[0.97]"
              >
                <div
                  className="h-40 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${service.heroImage}')` }}
                />
                <div className="p-md">
                  <h3 className="mb-xs font-title-md text-title-md">
                    {service.name}
                  </h3>
                  <p className="font-bold text-body-md text-primary">
                    Từ {formatCurrency(service.basePrice)}/{service.priceUnit}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-sm mb-xl rounded-3xl bg-surface-container-low px-margin-mobile py-lg">
          <h2 className="mb-xl text-center font-headline-lg-mobile text-headline-lg-mobile">
            Cách hoạt động
          </h2>
          <div className="grid grid-cols-2 gap-x-md gap-y-xl">
            {steps.map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-md flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MaterialIcon name={step.icon} className="text-[32px]" />
                </div>
                <span className="mb-xs block font-label-md text-label-md">
                  {step.title}
                </span>
                <p className="px-sm text-[12px] leading-tight text-on-surface-variant">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-xl">
          <div className="mb-md px-margin-mobile">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">
              Giúp việc đã xác minh
            </h2>
            <div className="mt-sm flex gap-sm">
              <div className="flex items-center gap-1 rounded-lg bg-secondary-container/20 px-sm py-[4px]">
                <MaterialIcon
                  name="verified_user"
                  className="text-[14px] text-secondary"
                />
                <span className="text-[11px] font-bold uppercase text-secondary">
                  Hồ sơ xác thực
                </span>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-sm py-[4px]">
                <MaterialIcon
                  name="gavel"
                  className="text-[14px] text-primary"
                />
                <span className="text-[11px] font-bold uppercase text-primary">
                  Lý lịch rõ ràng
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-md overflow-x-auto px-margin-mobile py-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="w-[280px] shrink-0 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(17,24,39,0.06)]"
              >
                <div className="mb-md flex items-center gap-md">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-surface-variant">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md">{review.name}</p>
                    <div className="flex text-secondary">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <MaterialIcon
                          key={index}
                          name="star"
                          filled={index < review.stars}
                          className="text-[16px]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="italic text-body-md text-on-surface-variant">
                  "{review.quote}"
                </p>
                <p className="mt-sm text-[12px] text-outline">
                  {review.author}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-outline-variant/10 bg-surface/80 px-margin-mobile py-sm shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-md gap-md pb-[max(16px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onRegister}
            className="h-tap-target-min flex-1 rounded-full border-[1.5px] border-primary font-bold text-primary transition-transform active:scale-95"
          >
            Đăng ký
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="h-tap-target-min flex-1 rounded-full bg-primary-container font-bold text-on-primary transition-transform active:scale-95"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
