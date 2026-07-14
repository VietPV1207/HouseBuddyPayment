import { useEffect, useState } from "react";
import { AdminLoginPage } from "../pages/AdminLoginPage";
import { AuthPage } from "../pages/AuthPage";
import { ChildPickupDetailPage } from "../pages/ChildPickupDetailPage";
import { GuestHomePage } from "../pages/GuestHomePage";
import { ServiceDetailPage } from "../pages/ServiceDetailPage";
import type { AuthMode, AuthSession } from "../types/auth";
import type { ChildPickupSelections, ServiceOption } from "../types/booking";

type GuestScreen =
  | "guest-home"
  | "service-detail"
  | "child-pickup-detail"
  | "auth"
  | "admin-login";

const defaultChildPickupSelections: ChildPickupSelections = {
  direction: "Đưa",
  vehicle: "Xe máy",
  childCount: 1,
  plan: "Dịch vụ lẻ",
};

type GuestAppProps = {
  services: ServiceOption[];
  onAuthenticated: (session: AuthSession) => void;
};

export function GuestApp({ services, onAuthenticated }: GuestAppProps) {
  const [screen, setScreen] = useState<GuestScreen>("guest-home");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >();
  const [, setChildPickupSelections] = useState<ChildPickupSelections>(
    defaultChildPickupSelections,
  );

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#/admin-login") setScreen("admin-login");
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const selectedService =
    services.find((service) => service.id === selectedServiceId) || services[0];

  const goToAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setScreen("auth");
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find((item) => item.id === serviceId);
    setScreen(
      service?.isChildPickup ? "child-pickup-detail" : "service-detail",
    );
  };

  if (screen === "service-detail") {
    return (
      <ServiceDetailPage
        service={selectedService}
        onBack={() => setScreen("guest-home")}
        onBook={() => goToAuth("register")}
      />
    );
  }

  if (screen === "child-pickup-detail") {
    return (
      <ChildPickupDetailPage
        service={selectedService}
        onBack={() => setScreen("guest-home")}
        onBook={(selections) => {
          setChildPickupSelections(selections);
          goToAuth("register");
        }}
      />
    );
  }

  if (screen === "auth") {
    return (
      <AuthPage
        initialMode={authMode}
        onExit={() => setScreen("guest-home")}
        onAuthenticated={onAuthenticated}
      />
    );
  }

  if (screen === "admin-login") {
    return (
      <AdminLoginPage
        onAuthenticated={onAuthenticated}
        onExit={() => setScreen("guest-home")}
      />
    );
  }

  return (
    <GuestHomePage
      services={services}
      onSelectService={handleSelectService}
      onLogin={() => goToAuth("login")}
      onRegister={() => goToAuth("register")}
    />
  );
}
