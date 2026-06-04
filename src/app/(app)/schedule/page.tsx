import { AdminModulePage } from "@/components/app/admin-module-page"
import { adminModules } from "@/lib/admin/module-config"

export default function SchedulePage() {
  return <AdminModulePage config={adminModules.schedule} />
}
