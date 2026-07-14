import type { AuthUser } from "../types/auth";

type DashboardPageProps = {
  user: AuthUser;
  onLogout: () => void;
  onOpenCreateBooking: () => void;
  onOpenCustomerWorkspace: () => void;
  onOpenHelperWorkspace: () => void;
  onOpenAdminWorkspace?: (
    tab: "dashboard" | "services" | "vouchers" | "customers" | "helpers",
  ) => void;
};

const customerActions = [
  {
    title: "Create booking",
    description: "Choose a service, duration, address, and schedule.",
    status: "Next screen",
  },
  {
    title: "My bookings",
    description: "Track booking status, assigned helper, and payment state.",
    status: "Pending API",
  },
  {
    title: "Voucher wallet",
    description: "View available vouchers and apply a code during checkout.",
    status: "Pending API",
  },
];

const helperActions = [
  {
    title: "Pending offers",
    description: "Review customer requests and accept or reject jobs.",
    status: "Next screen",
  },
  {
    title: "Work schedule",
    description: "See confirmed jobs, calendar slots, and job details.",
    status: "Pending API",
  },
  {
    title: "Wallet",
    description: "Check earnings, transaction history, and payout requests.",
    status: "Pending API",
  },
];

const adminActions = [
  {
    title: "Service pricing",
    description: "Manage categories, packages, tasks, and zone pricing.",
    status: "API ready",
  },
  {
    title: "Helper approvals",
    description: "Review helper registration and update account status.",
    status: "Pending UI",
  },
  {
    title: "System overview",
    description: "Monitor bookings, payments, reviews, and notifications.",
    status: "Pending API",
  },
];

function getActions(role: string) {
  if (role === "helper") return helperActions;
  if (role === "admin") return adminActions;
  return customerActions;
}

function getGreeting(role: string) {
  if (role === "helper") return "Ready for your next job?";
  if (role === "admin") return "Keep HouseBuddy running smoothly.";
  return "Let us plan your next home service.";
}

export function DashboardPage({
  user,
  onLogout,
  onOpenCreateBooking,
  onOpenCustomerWorkspace,
  onOpenHelperWorkspace,
  onOpenAdminWorkspace,
}: DashboardPageProps) {
  const actions = getActions(user.role);

  return (
    <main className="min-h-dvh px-[18px] py-6 md:px-10 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-[#dbe5e1] pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-500 font-extrabold text-white shadow-brand">
              HB
            </div>
            <div>
              <p className="text-sm font-bold text-brand-500">HouseBuddy</p>
              <h1 className="text-2xl font-bold leading-tight text-brand-900">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="rounded-2xl border border-[#d9e5e2] bg-white/80 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#6b7b80]">
                Signed in
              </p>
              <p className="mt-1 max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap font-bold text-brand-900">
                {user.email || user.phoneNumber}
              </p>
            </div>
            <button
              className="min-h-11 rounded-[12px] bg-[#fff0ee] px-5 font-bold text-[#a13f35] transition hover:bg-[#ffe3df] active:translate-y-px"
              type="button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[24px] border border-[#d9e5e2] bg-white/85 p-6 shadow-soft md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-brand-500">
              {user.role} workspace
            </p>
            <h2 className="mt-4 max-w-3xl text-[38px] font-bold leading-none text-brand-900 md:text-6xl">
              {getGreeting(user.role)}
            </h2>
            <p className="mt-5 max-w-2xl text-lg text-[#55656a]">
              This screen is a temporary role-based landing area. It gives the
              team a place to connect the next Sprint 2 flows without touching
              the auth form again.
            </p>
          </div>

          <aside className="rounded-[24px] border border-[#d9e5e2] bg-brand-900 p-6 text-white shadow-soft">
            <p className="text-sm font-bold text-brand-100">Account status</p>
            <div className="mt-5 grid gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-white/55">
                  Role
                </p>
                <p className="mt-1 text-xl font-bold capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-white/55">
                  Status
                </p>
                <p className="mt-1 text-xl font-bold capitalize">
                  {user.accountStatus}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-white/55">
                  User ID
                </p>
                <p className="mt-1 break-all font-mono text-sm text-white/80">
                  {user._id}
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {actions.map((action) => (
            <article
              className="rounded-[20px] border border-[#d9e5e2] bg-white/85 p-5 shadow-[0_14px_40px_rgba(33,52,55,0.08)]"
              key={action.title}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold leading-tight text-brand-900">
                  {action.title}
                </h3>
                <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
                  {action.status}
                </span>
              </div>
              <p className="mt-4 text-[#55656a]">{action.description}</p>
              <button
                className="mt-6 min-h-11 w-full rounded-[12px] border border-[#cde0dc] bg-white px-4 font-bold text-brand-900 transition hover:border-brand-500 hover:bg-brand-50 active:translate-y-px"
                type="button"
                onClick={() => {
                  if (
                    user.role === "customer" &&
                    action.title === "Create booking"
                  ) {
                    onOpenCreateBooking();
                    return;
                  }
                  if (user.role === "customer") {
                    onOpenCustomerWorkspace();
                    return;
                  }
                  if (user.role === "helper") {
                    onOpenHelperWorkspace();
                    return;
                  }
                  if (user.role === "admin" && onOpenAdminWorkspace) {
                    if (action.title === "Service pricing") {
                      onOpenAdminWorkspace("services");
                    } else if (action.title === "Helper approvals") {
                      onOpenAdminWorkspace("helpers");
                    } else {
                      onOpenAdminWorkspace("dashboard");
                    }
                  }
                }}
              >
                Open
              </button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
