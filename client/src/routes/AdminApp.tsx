import { AdminWorkspacePage } from "../pages/AdminWorkspacePage";
import type { AuthUser } from "../types/auth";

type AdminAppProps = {
  user: AuthUser;
  onLogout: () => void;
};

export function AdminApp({ user, onLogout }: AdminAppProps) {
  return (
    <AdminWorkspacePage
      user={user}
      initialTab="dashboard"
      onLogout={onLogout}
      onBackToDashboard={onLogout}
    />
  );
}
