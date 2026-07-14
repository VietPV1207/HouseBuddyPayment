import { useEffect, useState } from "react";
import { HelperBottomNav } from "../components/ui/HelperBottomNav";
import type { HelperNavTab } from "../components/ui/HelperBottomNav";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { getHelperProfile } from "../services/helperApi";
import type { AuthUser } from "../types/auth";
import type { HelperProfile } from "../types/helper";

type HelperAccountPageProps = {
  user: AuthUser;
  onNavigate: (tab: HelperNavTab) => void;
  onLogout: () => void;
};

export function HelperAccountPage({
  user,
  onNavigate,
  onLogout,
}: HelperAccountPageProps) {
  const [profile, setProfile] = useState<HelperProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHelperProfile(user._id)
      .then(setProfile)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không thể tải hồ sơ"),
      )
      .finally(() => setIsLoading(false));
  }, [user._id]);

  return (
    <div className="min-h-dvh bg-background pb-28 text-on-surface">
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-center bg-surface px-margin-mobile shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
          Tài khoản
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md px-margin-mobile pt-lg">
        <section className="mb-lg flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface-container-lowest bg-primary-container/10 shadow-md">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <MaterialIcon name="person" className="text-4xl text-primary" />
            )}
          </div>
          <h2 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile">
            {isLoading
              ? "..."
              : profile?.fullName || "Người giúp việc HouseBuddy"}
          </h2>
          <p className="text-body-md text-on-surface-variant">
            {user.phoneNumber}
          </p>
          {profile && (
            <div className="mt-2 flex items-center gap-1">
              <MaterialIcon
                name="star"
                filled
                className="text-[16px] text-secondary"
              />
              <span className="font-label-md text-label-md">
                {profile.rating.toFixed(1)}
              </span>
              {profile.identityVerified && (
                <span className="ml-2 flex items-center gap-1 rounded-full bg-primary-container/10 px-2 py-0.5 text-label-sm text-primary">
                  <MaterialIcon
                    name="verified"
                    filled
                    className="text-[14px]"
                  />
                  Đã xác minh
                </span>
              )}
            </div>
          )}
        </section>

        {error && (
          <p className="mb-4 rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
            {error}
          </p>
        )}

        {profile && profile.skills.length > 0 && (
          <section className="mb-6">
            <h3 className="mb-3 font-label-md text-label-md uppercase tracking-[0.04em] text-on-surface-variant">
              Kỹ năng
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-surface-container-high px-3 py-1 text-label-sm text-on-surface-variant"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-3 font-label-md text-label-md uppercase tracking-[0.04em] text-on-surface-variant">
            Cài đặt chung
          </h3>
          <div className="divide-y divide-outline-variant/20 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-variant"
            >
              <MaterialIcon name="rate_review" className="text-primary" />
              <span className="flex-1 font-body-md text-body-md">
                Phản hồi từ khách hàng
              </span>
              <MaterialIcon
                name="chevron_right"
                className="text-on-surface-variant"
              />
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-variant"
            >
              <MaterialIcon name="description" className="text-primary" />
              <span className="flex-1 font-body-md text-body-md">
                Điều khoản sử dụng
              </span>
              <MaterialIcon
                name="chevron_right"
                className="text-on-surface-variant"
              />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-4 py-4 text-left text-error transition-colors hover:bg-error-container/40"
            >
              <MaterialIcon name="logout" />
              <span className="flex-1 font-bold text-body-md">Đăng xuất</span>
            </button>
          </div>
        </section>
      </main>

      <HelperBottomNav active="account" onChange={onNavigate} />
    </div>
  );
}
