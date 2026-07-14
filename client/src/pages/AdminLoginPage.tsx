import { useState } from "react";
import type { FormEvent } from "react";
import { login as apiLogin } from "../services/authApi";
import { saveSession } from "../services/sessionStorage";
import type { AuthSession } from "../types/auth";
import { MaterialIcon } from "../components/ui/MaterialIcon";

type AdminLoginPageProps = {
  onAuthenticated: (session: AuthSession) => void;
  onExit: () => void;
};

export function AdminLoginPage({
  onAuthenticated,
  onExit,
}: AdminLoginPageProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = identifier.includes("@")
        ? { email: identifier, phoneNumber: "", password }
        : { email: "", phoneNumber: identifier, password };

      const data = await apiLogin(payload);

      if (data.user?.role !== "admin") {
        setError("Tài khoản này không có quyền truy cập trang quản trị!");
        setIsLoading(false);
        return;
      }

      saveSession(data.token, data.user);
      onAuthenticated({ token: data.token, user: data.user });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đăng nhập quản trị thất bại",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full bg-[#f8fafc]">
      {/* LEFT SIDE - GREEN PANEL */}
      <div className="hidden md:flex flex-col justify-between p-16 bg-gradient-to-br from-[#064e43] via-[#043e35] to-[#022f28] text-white relative overflow-hidden">
        {/* Subtle geometric background pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_25%,transparent_25%),linear-gradient(-45deg,#fff_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#fff_75%),linear-gradient(-45deg,transparent_75%,#fff_75%)] bg-[size:30px_30px]" />

        {/* Logo and App Title */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="grid size-11 place-items-center rounded-xl bg-white text-[#043e35] shadow-md">
            <MaterialIcon
              name="cleaning_services"
              className="text-2xl font-bold"
            />
          </div>
          <span className="text-2xl font-black tracking-tight">HouseBuddy</span>
          <span className="text-xs uppercase bg-white/10 px-2 py-0.5 rounded-full font-bold tracking-wider opacity-80">
            Admin
          </span>
        </div>

        {/* Central Slogans */}
        <div className="my-auto max-w-lg relative z-10 space-y-6">
          <h2 className="text-4xl font-extrabold leading-[1.2] tracking-tight">
            Nền tảng quản trị dịch vụ gia đình hàng đầu
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Quản lý lịch trình, đối tác và khách hàng của bạn một cách thông
            minh và chuyên nghiệp.
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-left transition hover:bg-white/10 duration-300">
              <p className="text-3xl font-black tracking-tight">5.000+</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold mt-1">
                Người giúp việc
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-left transition hover:bg-white/10 duration-300">
              <p className="text-3xl font-black tracking-tight">25k+</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold mt-1">
                Đơn hàng/Tháng
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-white/40 text-xs relative z-10 flex justify-between">
          <span>© 2024 HouseBuddy Vietnam. All rights reserved.</span>
          <button
            type="button"
            onClick={onExit}
            className="hover:text-white transition font-bold underline"
          >
            Về trang chủ khách hàng
          </button>
        </div>
      </div>

      {/* RIGHT SIDE - WHITE PANEL */}
      <div className="flex flex-col items-center justify-center p-6 bg-[#f8fafc] min-h-screen">
        {/* Main Card */}
        <div className="w-full max-w-md bg-white rounded-3xl p-10 border border-slate-200/60 shadow-[0_15px_40px_rgba(0,0,0,0.02)]">
          <div className="text-left mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Đăng nhập Quản trị
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
              Vui lòng nhập thông tin để truy cập hệ thống.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-bold text-rose-700 flex items-center gap-2">
              <MaterialIcon name="error" className="text-lg" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Email hệ thống
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 select-none">
                  <MaterialIcon name="mail" className="text-xl" />
                </span>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 pl-11 pr-4 py-3 text-sm focus:border-[#006d57] focus:bg-white outline-none transition-all duration-200"
                  placeholder="admin@housebuddy.vn"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-[#006d57] hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 select-none">
                  <MaterialIcon name="lock" className="text-xl" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 pl-11 pr-12 py-3 text-sm focus:border-[#006d57] focus:bg-white outline-none transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <MaterialIcon
                    name={showPassword ? "visibility_off" : "visibility"}
                    className="text-xl"
                  />
                </button>
              </div>
            </div>

            {/* Checkbox Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-[#006d57] focus:ring-[#006d57]"
              />
              <label
                htmlFor="remember"
                className="text-xs text-slate-500 font-medium select-none cursor-pointer"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full min-h-12 rounded-xl bg-[#006d57] hover:bg-[#005a48] font-bold text-white transition-all duration-200 active:translate-y-px mt-2 flex items-center justify-center gap-2 shadow-md shadow-brand/10 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              {!isLoading && (
                <MaterialIcon name="arrow_forward" className="text-lg" />
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-slate-100" />

          {/* IT Support Contact */}
          <p className="text-center text-xs text-slate-500 font-medium">
            Gặp sự cố khi đăng nhập?{" "}
            <a href="#" className="font-bold text-[#006d57] hover:underline">
              Liên hệ IT Support
            </a>
          </p>
        </div>

        {/* System Version info */}
        <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none">
          VERSION 2.4.0-BUILD.ADMIN
        </p>

        {/* Back Link for mobile users */}
        <button
          type="button"
          onClick={onExit}
          className="md:hidden mt-6 text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline"
        >
          Trở lại trang chủ Khách hàng
        </button>
      </div>
    </div>
  );
}
