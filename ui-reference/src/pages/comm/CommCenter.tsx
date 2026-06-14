export type CommSection =
  | "overview"
  | "sms"
  | "campaigns"
  | "templates"
  | "automations"
  | "automations-new"
  | "automations-detail"
  | "automations-edit"
  | "logs"
  | "settings"

export interface CommNavFn {
  (section: CommSection, id?: number): void
}
