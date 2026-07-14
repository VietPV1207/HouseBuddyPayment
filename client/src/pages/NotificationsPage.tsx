import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "../components/ui/BottomNav";
import type { BottomNavTab } from "../components/ui/BottomNav";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationApi";
import {
  formatNotificationTime,
  getNotificationDisplay,
  groupNotifications,
} from "../utils/notification";
import type { NotificationTone } from "../utils/notification";
import type { ApiNotification } from "../types/notification";

type NotificationsPageProps = {
  onNavigate: (tab: BottomNavTab) => void;
};

type FilterTab = "all" | "unread";

const toneClasses: Record<
  NotificationTone,
  { border: string; bg: string; icon: string }
> = {
  warning: {
    border: "border-l-secondary",
    bg: "bg-secondary-container/15",
    icon: "text-secondary",
  },
  success: {
    border: "border-l-primary",
    bg: "bg-primary-container/15",
    icon: "text-primary",
  },
  neutral: {
    border: "border-l-outline-variant",
    bg: "bg-surface-container-high",
    icon: "text-on-surface-variant",
  },
  danger: {
    border: "border-l-error",
    bg: "bg-error-container/40",
    icon: "text-error",
  },
};

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getNotifications()
      .then((data) => {
        if (!cancelled) setNotifications(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Không thể tải thông báo",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () =>
      notifications.filter((item) =>
        filter === "unread" ? !item.isRead : true,
      ),
    [notifications, filter],
  );

  const groups = useMemo(() => groupNotifications(visible), [visible]);

  const handleMarkOne = (id: string) => {
    setNotifications((current) =>
      current.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    markNotificationRead(id).catch(() => {
      // Best-effort: the optimistic update stays; a reload will resync.
    });
  };

  const handleMarkAll = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );
    markAllNotificationsRead().catch(() => {
      // Best-effort optimistic update.
    });
  };

  return (
    <div className="min-h-dvh bg-background pb-24 text-on-surface">
      <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between bg-surface px-margin-mobile">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low"
          aria-label="Quay lại"
        >
          <MaterialIcon name="arrow_back" />
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
          Thông báo
        </h1>
        <MaterialIcon name="favorite" className="text-primary" />
      </header>

      <main className="px-margin-mobile pt-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex gap-2 rounded-full bg-surface-container-low p-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 font-label-md text-label-md transition-colors ${
                filter === "all"
                  ? "bg-primary-container text-white"
                  : "text-on-surface-variant"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-full px-4 py-1.5 font-label-md text-label-md transition-colors ${
                filter === "unread"
                  ? "bg-primary-container text-white"
                  : "text-on-surface-variant"
              }`}
            >
              Chưa đọc
            </button>
          </div>
          <button
            type="button"
            onClick={handleMarkAll}
            className="shrink-0 font-bold text-label-sm text-primary"
          >
            Đánh dấu đã đọc
          </button>
        </div>

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
                className="h-24 animate-pulse rounded-2xl bg-surface-container-lowest"
              />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-container-high">
              <MaterialIcon
                name="notifications"
                className="text-4xl text-outline"
              />
            </div>
            <p className="text-body-md text-on-surface-variant">
              {filter === "unread"
                ? "Không có thông báo chưa đọc"
                : "Bạn chưa có thông báo nào"}
            </p>
          </div>
        ) : (
          groups.map(({ group, items }) => (
            <section key={group} className="mb-6">
              <h2 className="mb-3 font-label-md text-label-md uppercase tracking-[0.04em] text-on-surface-variant">
                {group}
              </h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const display = getNotificationDisplay(item.type);
                  const tone = toneClasses[display.tone];
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleMarkOne(item._id)}
                      className={`flex w-full items-start gap-3 rounded-2xl border-l-4 ${tone.border} ${
                        item.isRead ? "bg-surface-container-lowest" : tone.bg
                      } p-4 text-left shadow-[0_4px_20px_rgba(17,24,39,0.06)]`}
                    >
                      <div
                        className={`rounded-xl bg-surface-container-lowest p-2 ${tone.icon}`}
                      >
                        <MaterialIcon name={display.icon} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-body-md text-on-surface">
                            {item.title}
                          </h3>
                          {!item.isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-1 text-label-sm text-on-surface-variant">
                          {item.message}
                        </p>
                        <p className="mt-2 text-label-sm text-outline">
                          {formatNotificationTime(item.createdAt)} ·{" "}
                          {display.tag}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      <BottomNav active="notifications" onChange={onNavigate} />
    </div>
  );
}
