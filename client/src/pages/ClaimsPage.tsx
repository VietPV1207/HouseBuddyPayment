import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BottomNav } from "../components/ui/BottomNav";
import type { BottomNavTab } from "../components/ui/BottomNav";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { createClaim, getMyClaims } from "../services/customerApi";
import { getCustomerBookings } from "../services/bookingApi";
import type { ApiBooking } from "../types/booking";
import type { CustomerClaim, CustomerClaimStatus } from "../types/customer";

type ClaimsPageProps = {
  onNavigate: (tab: BottomNavTab) => void;
  onBack: () => void;
};

const labels: Record<CustomerClaimStatus, string> = {
  PENDING: "Đã tiếp nhận",
  REVIEWING: "Đang xử lý",
  NEEDS_INFO: "Cần bổ sung",
  APPROVED: "Đã chấp thuận",
  REJECTED: "Từ chối",
};

export function ClaimsPage({ onNavigate, onBack }: ClaimsPageProps) {
  const [claims, setClaims] = useState<CustomerClaim[]>([]);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bookingId: "",
    reason: "",
    description: "",
    evidence: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([getMyClaims(), getCustomerBookings()])
      .then(([claimData, bookingData]) => {
        setClaims(claimData);
        setBookings(
          bookingData.filter((item) =>
            [
              "COMPLETED",
              "AWAITING_PAYMENT",
              "PAID",
              "FINISHED",
              "REVIEWED",
            ].includes(item.status),
          ),
        );
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không thể tải yêu cầu"),
      );

  useEffect(() => {
    load();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createClaim({
        bookingId: form.bookingId,
        reason: form.reason,
        description: form.description,
        evidenceUrls: form.evidence
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setForm({ bookingId: "", reason: "", description: "", evidence: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi yêu cầu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background pb-24 text-on-surface">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-surface px-margin-mobile">
        <button type="button" onClick={onBack} aria-label="Quay lại">
          <MaterialIcon name="arrow_back" className="text-primary" />
        </button>
        <h1 className="font-headline-lg-mobile text-primary">Bồi thường</h1>
        <span className="w-6" />
      </header>
      <main className="mx-auto max-w-md space-y-4 px-margin-mobile pt-4">
        {error && (
          <p className="rounded-xl bg-error-container p-3 text-on-error-container">
            {error}
          </p>
        )}
        <Button onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Đóng biểu mẫu" : "Tạo yêu cầu mới"}
        </Button>
        {showForm && (
          <form
            onSubmit={submit}
            className="space-y-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4"
          >
            <label className="block space-y-2">
              <span className="font-label-md text-on-surface-variant">
                Đơn dịch vụ
              </span>
              <select
                required
                value={form.bookingId}
                onChange={(e) =>
                  setForm({ ...form, bookingId: e.target.value })
                }
                className="h-12 w-full rounded-xl border border-outline-variant bg-surface px-3"
              >
                <option value="">Chọn đơn</option>
                {bookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.serviceSnapshot?.name} - #
                    {booking._id.slice(-6).toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Lý do"
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
            <label className="block space-y-2">
              <span className="font-label-md text-on-surface-variant">
                Mô tả sự việc
              </span>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-xl border border-outline-variant bg-surface p-3"
              />
            </label>
            <label className="block space-y-2">
              <span className="font-label-md text-on-surface-variant">
                Link ảnh minh chứng (mỗi dòng một link)
              </span>
              <textarea
                rows={3}
                value={form.evidence}
                onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                className="w-full rounded-xl border border-outline-variant bg-surface p-3"
              />
            </label>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </form>
        )}
        {claims.length === 0 && !showForm ? (
          <div className="py-14 text-center text-on-surface-variant">
            <MaterialIcon name="fact_check" className="text-4xl" />
            <p className="mt-2">Bạn chưa có yêu cầu bồi thường.</p>
          </div>
        ) : (
          claims.map((claim) => (
            <article
              key={claim._id}
              className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{claim.reason}</h2>
                  <p className="text-label-sm text-on-surface-variant">
                    #{claim.bookingId.slice(-6).toUpperCase()} -{" "}
                    {new Date(claim.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <span className="rounded-full bg-primary-container/15 px-3 py-1 text-label-sm font-bold text-primary">
                  {labels[claim.status]}
                </span>
              </div>
              <p className="mt-3 text-body-md text-on-surface-variant">
                {claim.description}
              </p>
            </article>
          ))
        )}
      </main>
      <BottomNav active="account" onChange={onNavigate} />
    </div>
  );
}
