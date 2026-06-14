import {
  BellRingIcon,
  CreditCardIcon,
  MessageSquareTextIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
  WalletCardsIcon,
} from "lucide-react"
import type { ReactNode } from "react"

import { PageHeader } from "@/components/app/page-header"
import {
  AutoSaveToggle,
  DirtyForm,
  DirtySubmitButton,
} from "@/components/communication/sms-settings-form-controls"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  createSmsRechargeRequest,
  updateTenantSmsSettings,
  updateTenantSmsSettingsInline,
} from "@/lib/actions/sms"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getSmsWallet,
  getTenantSmsSettings,
  listSmsCreditPackages,
  listSmsCreditTransactions,
  listSmsTemplates,
  type SmsRecipientType,
  type SmsTemplateRecord,
} from "@/lib/data/sms"

const recipientLabels: Record<SmsRecipientType, string> = {
  both: "Student and guardian",
  guardian: "Guardian",
  student: "Student",
}

export default async function CommunicationSettingsPage() {
  const admin = await requireAdminContext()
  const [wallet, packages, settings, templates, transactions] =
    await Promise.all([
      getSmsWallet(admin.tenantId),
      listSmsCreditPackages(),
      getTenantSmsSettings(admin.tenantId),
      listSmsTemplates(admin.tenantId),
      listSmsCreditTransactions(admin.tenantId, 5),
    ])

  return (
    <div className="space-y-5 p-4 md:p-6">
      <PageHeader
        badge={wallet?.sms_enabled === false ? "Paused" : "Active"}
        description="Manage SMS credits, recharge requests, recipient defaults, and automated payment message rules."
        title="Communication Settings"
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <WalletCardsIcon className="size-4 text-primary" />
              <CardTitle>SMS Wallet / Balance</CardTitle>
            </div>
            <CardDescription>
              Current tenant credit balance and recent ledger activity.
            </CardDescription>
            <CardAction>
              <Badge
                className={
                  wallet?.sms_enabled === false
                    ? "border-muted bg-muted text-muted-foreground"
                    : "border-success/20 bg-success/10 text-success"
                }
                variant="outline"
              >
                {wallet?.sms_enabled === false ? "Disabled" : "Enabled"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Available credits" value={wallet?.available_credits ?? 0} />
              <Metric label="Reserved credits" value={wallet?.reserved_credits ?? 0} />
              <Metric label="Purchased" value={wallet?.total_purchased_credits ?? 0} />
              <Metric label="Used" value={wallet?.total_used_credits ?? 0} />
            </div>

            <div className="rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <p className="text-sm font-medium">Recent wallet ledger</p>
                <p className="text-xs text-muted-foreground">
                  Low balance at {wallet?.low_balance_threshold ?? 0} credits
                </p>
              </div>
              <div className="divide-y">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div
                      className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[1fr_auto]"
                      key={transaction.id}
                    >
                      <div>
                        <p className="font-medium capitalize">
                          {transaction.transaction_type.replaceAll("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.description ?? "SMS wallet transaction"}
                        </p>
                      </div>
                      <p
                        className={
                          transaction.credit_amount >= 0
                            ? "font-semibold text-success"
                            : "font-semibold text-destructive"
                        }
                      >
                        {transaction.credit_amount >= 0 ? "+" : ""}
                        {transaction.credit_amount}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-6 text-sm text-muted-foreground">
                    No SMS credit transactions yet.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="size-4 text-primary" />
              <CardTitle>Recharge Credits</CardTitle>
            </div>
            <CardDescription>
              Submit a pending request after sending payment to the center.
            </CardDescription>
          </CardHeader>
          <form action={createSmsRechargeRequest}>
            <CardContent className="space-y-4 pt-5">
              <Field label="Credit package">
                <Select
                  defaultValue={packages[0]?.id ?? ""}
                  disabled={packages.length === 0}
                  name="package_id"
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectGroup>
                      {packages.map((creditPackage) => (
                        <SelectItem key={creditPackage.id} value={creditPackage.id}>
                          {creditPackage.name} · {creditPackage.credits} credits ·{" "}
                          {formatTaka(creditPackage.price)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Payment method">
                  <Select defaultValue="bkash" name="payment_method">
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        <SelectItem value="bkash">bKash</SelectItem>
                        <SelectItem value="nagad">Nagad</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Transaction reference">
                  <Input name="transaction_id" placeholder="TRX ID or receipt no." />
                </Field>
              </div>
              <Field label="Payment note">
                <Textarea
                  className="min-h-20"
                  name="payment_note"
                  placeholder="Optional note for the approval team"
                />
              </Field>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button disabled={packages.length === 0} type="submit">
                Request recharge
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <DirtyForm action={updateTenantSmsSettings}>
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4 text-primary" />
              <CardTitle>Default Recipient Rules</CardTitle>
            </div>
            <CardDescription>
              Set the fallback recipient and guardrails for manual and automated SMS.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Default recipient">
              <RecipientSelect
                defaultValue={settings.default_recipient_type}
                name="default_recipient_type"
              />
            </Field>
            <Field label="Bulk recipients">
              <Input
                min={1}
                name="max_bulk_recipients"
                type="number"
                defaultValue={settings.max_bulk_recipients}
              />
            </Field>
            <Field label="Bulk segments">
              <Input
                min={1}
                name="max_bulk_segments"
                type="number"
                defaultValue={settings.max_bulk_segments}
              />
            </Field>
            <Field label="Automation segments">
              <Input
                min={1}
                name="max_automated_segments"
                type="number"
                defaultValue={settings.max_automated_segments}
              />
            </Field>
            <Field label="Single SMS segments">
              <Input
                min={1}
                name="max_single_sms_segments"
                type="number"
                defaultValue={settings.max_single_sms_segments}
              />
            </Field>
          </CardContent>
          <CardFooter className="justify-end border-t">
            <DirtySubmitButton>
              Save recipient rules
            </DirtySubmitButton>
          </CardFooter>
        </Card>
      </DirtyForm>

      <div className="grid gap-4 xl:grid-cols-2">
        <DirtyForm
          action={updateTenantSmsSettings}
          autoSaveAction={updateTenantSmsSettingsInline}
        >
          <AutomationCard
            description="Send a receipt-style message when a student fee payment is recorded."
            enabled={settings.payment_confirmation_enabled}
            enabledName="payment_confirmation_enabled"
            icon={<ReceiptTextIcon className="size-4 text-primary" />}
            recipient={settings.payment_confirmation_recipient}
            recipientName="payment_confirmation_recipient"
            templateId={settings.payment_confirmation_template_id}
            templateName="payment_confirmation_template_id"
            templates={templatesFor(templates, "payment_confirmation")}
            title="Payment Confirmation SMS"
          />
        </DirtyForm>
        <DirtyForm
          action={updateTenantSmsSettings}
          autoSaveAction={updateTenantSmsSettingsInline}
        >
          <AutomationCard
            dayDefaultValue={settings.payment_reminder_days_before_due}
            dayLabel="Days before due"
            dayName="payment_reminder_days_before_due"
            description="Remind recipients before the monthly fee due date."
            enabled={settings.payment_reminder_enabled}
            enabledName="payment_reminder_enabled"
            icon={<BellRingIcon className="size-4 text-primary" />}
            recipient={settings.payment_reminder_recipient}
            recipientName="payment_reminder_recipient"
            templateId={settings.payment_reminder_template_id}
            templateName="payment_reminder_template_id"
            templates={templatesFor(templates, "payment_reminder")}
            title="Payment Reminder SMS"
          />
        </DirtyForm>
        <DirtyForm
          action={updateTenantSmsSettings}
          autoSaveAction={updateTenantSmsSettingsInline}
        >
          <AutomationCard
            dayDefaultValue={settings.grace_period_days_after_due}
            dayLabel="Days after due"
            dayName="grace_period_days_after_due"
            description="Notify families when the grace period has started."
            enabled={settings.grace_period_enabled}
            enabledName="grace_period_enabled"
            icon={<MessageSquareTextIcon className="size-4 text-primary" />}
            recipient={settings.grace_period_recipient}
            recipientName="grace_period_recipient"
            templateId={settings.grace_period_template_id}
            templateName="grace_period_template_id"
            templates={templatesFor(templates, "grace_period")}
            title="Grace Period SMS"
          />
        </DirtyForm>
        <DirtyForm
          action={updateTenantSmsSettings}
          autoSaveAction={updateTenantSmsSettingsInline}
        >
          <AutomationCard
            dayDefaultValue={settings.overdue_warning_days_before_overdue}
            dayLabel="Days before overdue"
            dayName="overdue_warning_days_before_overdue"
            description="Warn recipients before a ledger is treated as overdue."
            enabled={settings.overdue_warning_enabled}
            enabledName="overdue_warning_enabled"
            icon={<BellRingIcon className="size-4 text-primary" />}
            recipient={settings.overdue_warning_recipient}
            recipientName="overdue_warning_recipient"
            templateId={settings.overdue_warning_template_id}
            templateName="overdue_warning_template_id"
            templates={templatesFor(templates, "overdue_warning")}
            title="Overdue Warning SMS"
          />
        </DirtyForm>
      </div>

      <DirtyForm action={updateTenantSmsSettings}>
        <Card>
          <CardHeader className="border-b">
            <CardTitle>SMS Signature</CardTitle>
            <CardDescription>
              Append a consistent center signature to outgoing communication.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <Field label="Signature text">
              <Textarea
                className="min-h-24"
                defaultValue={settings.sms_signature ?? ""}
                maxLength={160}
                name="sms_signature"
                placeholder={`- ${admin.tenantName}`}
              />
            </Field>
          </CardContent>
          <CardFooter className="justify-end border-t">
            <DirtySubmitButton>
              Save signature
            </DirtySubmitButton>
          </CardFooter>
        </Card>
      </DirtyForm>
    </div>
  )
}

function AutomationCard({
  dayDefaultValue,
  dayLabel,
  dayName,
  description,
  enabled,
  enabledName,
  icon,
  recipient,
  recipientName,
  templateId,
  templateName,
  templates,
  title,
}: {
  dayDefaultValue?: number
  dayLabel?: string
  dayName?: string
  description: string
  enabled: boolean
  enabledName: string
  icon: ReactNode
  recipient: SmsRecipientType
  recipientName: string
  templateId: string | null
  templateName: string
  templates: SmsTemplateRecord[]
  title: string
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <AutoSaveToggle defaultChecked={enabled} name={enabledName} />
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
        {dayName && dayLabel ? (
          <Field label={dayLabel}>
            <Input
              defaultValue={dayDefaultValue ?? 1}
              min={0}
              name={dayName}
              type="number"
            />
          </Field>
        ) : null}
        <Field label="Recipient">
          <RecipientSelect defaultValue={recipient} name={recipientName} />
        </Field>
        <Field label="SMS template">
          <TemplateSelect
            defaultValue={templateId ?? "none"}
            name={templateName}
            templates={templates}
          />
        </Field>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <DirtySubmitButton>
          Save automation
        </DirtySubmitButton>
      </CardFooter>
    </Card>
  )
}

function RecipientSelect({
  defaultValue,
  name,
}: {
  defaultValue: SmsRecipientType
  name: string
}) {
  return (
    <Select defaultValue={defaultValue} name={name}>
      <SelectTrigger className="h-9 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          {Object.entries(recipientLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function TemplateSelect({
  defaultValue,
  name,
  templates,
}: {
  defaultValue: string
  name: string
  templates: SmsTemplateRecord[]
}) {
  return (
    <Select defaultValue={defaultValue} name={name}>
      <SelectTrigger className="h-9 w-full">
        <SelectValue placeholder="No template selected" />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          <SelectItem value="none">No template</SelectItem>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">
        {value.toLocaleString("en-US")}
      </p>
    </div>
  )
}

function templatesFor(
  templates: SmsTemplateRecord[],
  category: SmsTemplateRecord["category"]
) {
  const categoryTemplates = templates.filter(
    (template) => template.category === category
  )

  return categoryTemplates.length > 0 ? categoryTemplates : templates
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`
}
