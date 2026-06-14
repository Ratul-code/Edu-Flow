import { AutomationBuilder } from "./AutomationBuilder"
import type { CommNavFn } from "./CommCenter"

interface CommAutomationNewProps {
  onNavigate: CommNavFn
}

export function CommAutomationNew({ onNavigate }: CommAutomationNewProps) {
  return (
    <AutomationBuilder
      mode="new"
      onSave={() => onNavigate("automations")}
      onCancel={() => onNavigate("automations")}
    />
  )
}
