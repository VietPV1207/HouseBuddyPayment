import { useEffect, useState } from "react";
import type { AuthUser } from "../types/auth";
import {
  getCustomers,
  updateCustomerStatus,
  getPendingHelpers,
  getAllHelpers,
  approveHelper,
  rejectHelper,
  updateHelperStatus,
  getVoucherPolicies,
  createVoucherPolicy,
  updateVoucherPolicy,
  grantVoucherToCustomer,
  getServiceCategories,
  createServiceCategory,
  getServicePackages,
  createServicePackage,
  deactivateServicePackage,
  updateDurationTiers,
  createTaskOrAddon,
  getBookings,
} from "../services/adminApi";

import type {
  AdminCustomer,
  AdminHelper,
  AdminVoucherPolicy,
  AdminServiceCategory,
  AdminServicePackage,
  AdminBooking,
} from "../services/adminApi";

import { DashboardTab } from "./admin/DashboardTab";
import { CustomersTab } from "./admin/CustomersTab";
import { HelpersTab } from "./admin/HelpersTab";
import { VouchersTab } from "./admin/VouchersTab";
import { ServicesTab } from "./admin/ServicesTab";
import { MaterialIcon } from "../components/ui/MaterialIcon";

type AdminTab =
  | "dashboard"
  | "bookings"
  | "customers"
  | "helpers"
  | "services"
  | "vouchers"
  | "claims"
  | "ratings"
  | "reports";

type AdminWorkspacePageProps = {
  user: AuthUser;
  initialTab?: AdminTab;
  onLogout: () => void;
  onBackToDashboard: () => void;
};

export function AdminWorkspacePage({
  user,
  initialTab = "dashboard",
  onLogout,
  onBackToDashboard,
}: AdminWorkspacePageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // API Data states
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [helpers, setHelpers] = useState<AdminHelper[]>([]);
  const [pendingHelpers, setPendingHelpers] = useState<AdminHelper[]>([]);
  const [voucherPolicies, setVoucherPolicies] = useState<AdminVoucherPolicy[]>(
    [],
  );
  const [categories, setCategories] = useState<AdminServiceCategory[]>([]);
  const [services, setServices] = useState<AdminServicePackage[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);

  // Modal / Form toggle states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sub-component shared overlay hooks
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(null);
  const [selectedHelper, setSelectedHelper] = useState<AdminHelper | null>(
    null,
  );
  const [helperRejectId, setHelperRejectId] = useState<string | null>(null);

  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedPkgForTiers, setSelectedPkgForTiers] =
    useState<AdminServicePackage | null>(null);
  const [selectedPkgForTask, setSelectedPkgForTask] =
    useState<AdminServicePackage | null>(null);

  // Fetch functions
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      if (activeTab === "dashboard") {
        const [c, h, ph, vp, b] = await Promise.all([
          getCustomers(),
          getAllHelpers(),
          getPendingHelpers(),
          getVoucherPolicies(),
          getBookings().catch(() => [] as AdminBooking[]),
        ]);
        setCustomers(c);
        setHelpers(h);
        setPendingHelpers(ph);
        setVoucherPolicies(vp);
        setBookings(b);
      } else if (activeTab === "bookings") {
        const b = await getBookings().catch(() => [] as AdminBooking[]);
        setBookings(b);
      } else if (activeTab === "customers") {
        const c = await getCustomers();
        setCustomers(c);
      } else if (activeTab === "helpers") {
        const [h, ph] = await Promise.all([
          getAllHelpers(),
          getPendingHelpers(),
        ]);
        setHelpers(h);
        setPendingHelpers(ph);
      } else if (activeTab === "vouchers") {
        const [vp, c] = await Promise.all([
          getVoucherPolicies(),
          getCustomers(),
        ]);
        setVoucherPolicies(vp);
        setCustomers(c);
      } else if (activeTab === "services") {
        const [cat, s] = await Promise.all([
          getServiceCategories(),
          getServicePackages(),
        ]);
        setCategories(cat);

        setServices(s);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Tải dữ liệu thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handlers
  const handleSaveCustomerStatus = async (status: string, notes: string) => {
    if (!selectedCustomer) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      await updateCustomerStatus(selectedCustomer._id, status, notes);
      setSuccessMsg("Cập nhật trạng thái khách hàng thành công!");
      setSelectedCustomer(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi cập nhật");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveHelper = async (helperId: string) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt hồ sơ người giúp việc này?"))
      return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      await approveHelper(helperId);
      setSuccessMsg("Duyệt hồ sơ thành công!");
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi duyệt hồ sơ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRejectHelper = async (notes: string) => {
    if (!helperRejectId) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      await rejectHelper(helperRejectId, notes);
      setSuccessMsg("Từ chối hồ sơ người giúp việc thành công!");
      setHelperRejectId(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi từ chối hồ sơ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHelperStatus = async (status: string, notes: string) => {
    if (!selectedHelper) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      await updateHelperStatus(selectedHelper._id, status, notes);
      setSuccessMsg("Cập nhật trạng thái người giúp việc thành công!");
      setSelectedHelper(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi cập nhật");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVoucherPolicy = async (policyData: any) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await createVoucherPolicy(policyData);
      setSuccessMsg("Tạo chính sách voucher mới thành công!");
      setShowVoucherModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi tạo voucher");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGrantVoucher = async (
    policyId: string,
    customerId: string,
    notes: string,
  ) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await grantVoucherToCustomer(policyId, customerId, notes);
      setSuccessMsg("Cấp voucher cho khách hàng thành công!");
      setShowGrantModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi cấp voucher");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCategory = async (name: string, description: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await createServiceCategory({ name, description });
      setSuccessMsg("Thêm danh mục thành công!");
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi thêm danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePackage = async (
    categoryId: string,
    packageName: string,
    basePrice: number,
    description: string,
  ) => {
    setIsLoading(true);
    setErrorMsg("");
    const cat = categories.find((c) => c._id === categoryId);
    try {
      await createServicePackage({
        categoryId,
        categoryName: cat ? cat.name : "Dịch vụ",
        packageName,
        basePrice,
        description,
        durationTiers: [],
      });
      setSuccessMsg("Thêm gói dịch vụ thành công!");
      setShowPackageModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi thêm gói dịch vụ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivatePackage = async (serviceId: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await deactivateServicePackage(serviceId, false);
      if (res.hasFutureBookings) {
        if (
          confirm(
            "Gói dịch vụ này đang có lịch đặt trong tương lai. Bạn có chắc chắn muốn ép buộc hủy hoạt động gói này?",
          )
        ) {
          await deactivateServicePackage(serviceId, true);
          setSuccessMsg("Hủy hoạt động gói dịch vụ thành công!");
        }
      } else {
        setSuccessMsg("Hủy hoạt động gói dịch vụ thành công!");
      }
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi dừng gói dịch vụ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDurationTier = async (duration: number, price: number) => {
    if (!selectedPkgForTiers) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const updatedTiers = [
        ...selectedPkgForTiers.durationTiers,
        { duration, price },
      ];
      await updateDurationTiers(selectedPkgForTiers._id, updatedTiers);
      setSuccessMsg("Thêm bậc thời gian thành công!");
      setSelectedPkgForTiers(null);
      fetchData();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Lỗi thêm bậc thời gian",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTask = async (
    taskName: string,
    price: number,
    note: string,
  ) => {
    if (!selectedPkgForTask) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      await createTaskOrAddon(selectedPkgForTask._id, {
        taskName,
        price,
        note,
      });
      setSuccessMsg("Thêm Add-on nhiệm vụ thành công!");
      setSelectedPkgForTask(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi thêm Add-on");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-[#f4f7f6] md:grid-cols-[260px_1fr]">
      {/* Sidebar - Desktop */}
      <aside className="hidden flex-col justify-between border-r border-[#e1e9e7] bg-white p-6 md:flex">
        <div className="flex flex-col gap-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#006d57] font-extrabold text-white">
              <MaterialIcon name="home_work" className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 leading-none">
                HouseBuddy
              </h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                — ADMIN PORTAL
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {[
              { id: "dashboard", name: "Tổng quan", icon: "📊" },
              { id: "bookings", name: "Đơn hàng", icon: "📋" },
              { id: "customers", name: "Khách hàng", icon: "👤" },
              { id: "helpers", name: "Người giúp việc", icon: "👥" },
              { id: "services", name: "Dịch vụ & Giá", icon: "🛠️" },
              { id: "vouchers", name: "Khuyến mãi", icon: "🏷️" },
              { id: "claims", name: "Bồi thường", icon: "💸" },
              { id: "ratings", name: "Đánh giá", icon: "⭐" },
              { id: "reports", name: "Báo cáo", icon: "📊" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-150 ${
                  activeTab === tab.id
                    ? "bg-[#e5f1ee] text-[#006d57] shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab(tab.id as AdminTab)}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6">
          <button
            className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-[#006d57] transition"
            onClick={onBackToDashboard}
          >
            <MaterialIcon name="settings" className="text-lg" /> Cài đặt
          </button>
          <button
            className="flex items-center gap-3 text-sm font-bold text-rose-600 hover:text-rose-800 transition"
            onClick={onLogout}
          >
            <MaterialIcon name="logout" className="text-lg" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (PWA menu) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/45"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative flex w-[260px] flex-col justify-between bg-white border-r border-[#e1e9e7] p-6">
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-[#006d57] font-extrabold text-white">
                    <MaterialIcon name="home_work" className="text-lg" />
                  </div>
                  <h2 className="text-base font-black text-slate-800">
                    HouseBuddy
                  </h2>
                </div>
                <button
                  className="text-xl text-slate-400 hover:text-slate-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {[
                  { id: "dashboard", name: "Tổng quan", icon: "📊" },
                  { id: "bookings", name: "Đơn hàng", icon: "📋" },
                  { id: "customers", name: "Khách hàng", icon: "👤" },
                  { id: "helpers", name: "Người giúp việc", icon: "👥" },
                  { id: "services", name: "Dịch vụ & Giá", icon: "🛠️" },
                  { id: "vouchers", name: "Khuyến mãi", icon: "🏷️" },
                  { id: "claims", name: "Bồi thường", icon: "💸" },
                  { id: "ratings", name: "Đánh giá", icon: "⭐" },
                  { id: "reports", name: "Báo cáo", icon: "📊" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                      activeTab === tab.id
                        ? "bg-[#e5f1ee] text-[#006d57]"
                        : "text-slate-600"
                    }`}
                    onClick={() => {
                      setActiveTab(tab.id as AdminTab);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
            <button
              className="text-left font-bold text-rose-600"
              onClick={onLogout}
            >
              🚪 Đăng xuất
            </button>
          </aside>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex flex-col overflow-y-auto max-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#e1e9e7] bg-white px-8 shadow-sm">
          {/* Left search */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button
              className="grid size-10 place-items-center rounded-xl border border-[#d9e5e2] text-slate-600 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              ☰
            </button>
            <div className="relative flex items-center w-full">
              <span className="absolute left-3 text-slate-400 select-none">
                <MaterialIcon name="search" className="text-xl" />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng, helper, khách hàng..."
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#006d57] focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Right details */}
          <div className="flex items-center gap-6">
            {/* Date filter dropdown */}
            <div className="relative">
              <select className="appearance-none rounded-xl border border-slate-200/80 bg-white pl-4 pr-10 py-2 text-xs font-bold text-slate-600 outline-none focus:border-[#006d57]">
                <option value="30">30 ngày qua</option>
                <option value="7">7 ngày qua</option>
                <option value="90">90 ngày qua</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <MaterialIcon name="keyboard_arrow_down" className="text-sm" />
              </span>
            </div>

            {/* Notification Badge */}
            <div className="relative cursor-pointer">
              <MaterialIcon
                name="notifications"
                className="text-slate-500 text-2xl"
              />
              <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                4
              </span>
            </div>

            {/* Avatar Dropdown info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-[#006d57] uppercase tracking-wider">
                  Quản trị viên
                </p>
                <p className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold text-slate-800 mt-0.5">
                  {user.email?.split("@")[0] || "Admin Trung"}
                </p>
              </div>
              <div className="size-10 rounded-full bg-[#006d57] text-white font-bold flex items-center justify-center text-sm shadow-inner border border-slate-100">
                {user.email?.[0].toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="p-8">
          {/* Notifications Alerts */}
          {successMsg && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
              <p className="text-sm font-bold">✨ {successMsg}</p>
              <button
                className="font-bold text-emerald-950"
                onClick={() => setSuccessMsg("")}
              >
                ✕
              </button>
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800">
              <p className="text-sm font-bold">⚠️ Lỗi: {errorMsg}</p>
              <button
                className="font-bold text-rose-950"
                onClick={() => setErrorMsg("")}
              >
                ✕
              </button>
            </div>
          )}

          {isLoading && (
            <div className="mb-6 rounded-xl bg-brand-50 border border-brand-200 p-4 text-brand-800 animate-pulse text-center font-bold text-sm">
              ⏳ Hệ thống đang xử lý dữ liệu...
            </div>
          )}

          {/* Render Active Tab */}
          {activeTab === "dashboard" && (
            <DashboardTab
              customersCount={(customers || []).length}
              helpersCount={(helpers || []).length}
              pendingHelpers={pendingHelpers || []}
              voucherPolicies={voucherPolicies || []}
              bookings={bookings || []}
              onTabChange={(tab) => setActiveTab(tab)}
              onApproveHelper={handleApproveHelper}
            />
          )}

          {activeTab === "bookings" && (
            <div className="rounded-2xl border border-[#d9e5e2] bg-white p-6 shadow-soft overflow-x-auto">
              <h3 className="text-lg font-bold text-brand-900 mb-4">
                📋 Danh sách đơn đặt lịch
              </h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e1e9e7] text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Mã đơn</th>
                    <th className="py-3 px-4">Khách hàng</th>
                    <th className="py-3 px-4">Dịch vụ</th>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Thành tiền</th>
                    <th className="py-3 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {(bookings || []).map((b) => (
                    <tr key={b._id}>
                      <td className="py-3 px-4 font-bold text-[#006d57]">
                        #HB-{b._id?.slice(-6).toUpperCase() || "XXXXXX"}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {b.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {b.serviceSnapshot?.name || "Dịch vụ"}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {b.scheduledTime
                          ? new Date(b.scheduledTime).toLocaleDateString()
                          : "Chưa có"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {(b.totalAmount || 0).toLocaleString()} đ
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            b.status === "COMPLETED" ||
                            b.status === "PAID" ||
                            b.status === "FINISHED"
                              ? "bg-emerald-50 text-emerald-700"
                              : b.status === "CANCELLED"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!bookings || bookings.length === 0) && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-slate-400"
                      >
                        Không có dữ liệu đơn hàng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "customers" && (
            <CustomersTab
              customers={customers || []}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              onUpdateStatus={handleSaveCustomerStatus}
            />
          )}

          {activeTab === "helpers" && (
            <HelpersTab
              helpers={helpers || []}
              pendingHelpers={pendingHelpers || []}
              onApproveHelper={handleApproveHelper}
              onRejectHelper={handleSaveRejectHelper}
              onUpdateStatus={handleSaveHelperStatus}
              selectedHelper={selectedHelper}
              setSelectedHelper={setSelectedHelper}
              helperRejectId={helperRejectId}
              setHelperRejectId={setHelperRejectId}
            />
          )}

          {activeTab === "vouchers" && (
            <VouchersTab
              voucherPolicies={voucherPolicies || []}
              customers={customers || []}
              onCreatePolicy={handleSaveVoucherPolicy}
              onGrantVoucher={handleSaveGrantVoucher}
              onToggleActive={async (policyId, isActive) => {
                await updateVoucherPolicy(policyId, { isActive });
                setSuccessMsg("Đã chuyển đổi trạng thái voucher!");
                fetchData();
              }}
              showVoucherModal={showVoucherModal}
              setShowVoucherModal={setShowVoucherModal}
              showGrantModal={showGrantModal}
              setShowGrantModal={setShowGrantModal}
            />
          )}

          {activeTab === "services" && (
            <ServicesTab
              categories={categories || []}
              services={services || []}
              onCreateCategory={handleSaveCategory}
              onCreatePackage={handleSavePackage}
              onDeactivatePackage={handleDeactivatePackage}
              onAddDurationTier={handleSaveDurationTier}
              onAddTask={handleSaveTask}
              showCategoryModal={showCategoryModal}
              setShowCategoryModal={setShowCategoryModal}
              showPackageModal={showPackageModal}
              setShowPackageModal={setShowPackageModal}
              selectedPkgForTiers={selectedPkgForTiers}
              setSelectedPkgForTiers={setSelectedPkgForTiers}
              selectedPkgForTask={selectedPkgForTask}
              setSelectedPkgForTask={setSelectedPkgForTask}
            />
          )}

          {["claims", "ratings", "reports"].includes(activeTab) && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-soft">
              <MaterialIcon
                name="construction"
                className="text-5xl text-slate-300"
              />
              <h3 className="text-base font-bold text-slate-800 mt-4">
                Tính năng đang được xây dựng
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Giao diện quản lý tab {activeTab} sẽ sớm xuất hiện ở các bản
                nâng cấp tiếp theo.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
