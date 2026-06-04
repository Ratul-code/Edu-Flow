import { AdminModulePage } from "@/components/app/admin-module-page"
import { adminModules } from "@/lib/admin/module-config"

export default function SettingsPage() {
  return <AdminModulePage config={adminModules.settings} />
}
