import * as React from "react"
import { MessageSquare, Mail, Smartphone, CheckCircle2, Lock, Settings2, Palette, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function CommSettings() {
  const [signature, setSignature] = React.useState("- Edu Flow Academy\nPhone: 01711-000000\nwww.eduflow.app")
  const [defaultChannel, setDefaultChannel] = React.useState("sms")
  const [autoConfirm, setAutoConfirm] = React.useState(true)
  const [autoReminder, setAutoReminder] = React.useState(true)
  const [testNumber, setTestNumber] = React.useState("")

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h2 className="text-base font-semibold">Communication Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Configure channels, branding, and defaults for your communication platform</p>
      </div>

      {/* SMS Configuration */}
      <Card className="py-0 gap-0">
        <CardHeader className="px-5 py-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">SMS Configuration</CardTitle>
                <CardDescription className="text-xs mt-0.5">Connect your SMS gateway provider</CardDescription>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success mt-1">
              <span className="size-1.5 rounded-full bg-success inline-block" />
              Connected
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Provider</Label>
              <Select defaultValue="ssl-wireless">
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ssl-wireless">SSL Wireless</SelectItem>
                  <SelectItem value="bdbulksms">BDBulkSMS</SelectItem>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="custom">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Sender ID / Mask</Label>
              <Input className="h-8 text-sm" defaultValue="EduFlow" placeholder="e.g. EduFlow" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">API Key</Label>
              <div className="relative">
                <Input className="h-8 text-sm pr-10" type="password" defaultValue="sk_live_xxxxxxxxxxxxxx" />
                <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">API Secret</Label>
              <div className="relative">
                <Input className="h-8 text-sm pr-10" type="password" defaultValue="sk_secret_xxxxxx" />
                <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Balance info */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border px-4 py-3">
            <CheckCircle2 className="size-4 text-success shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium">SMS Balance: 4,820 credits</p>
              <p className="text-xs text-muted-foreground mt-0.5">Approx. 4,820 standard SMS · Top-up at SSL Wireless dashboard</p>
            </div>
          </div>

          {/* Test SMS */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Send Test SMS</Label>
            <div className="flex gap-2">
              <Input
                className="h-8 text-sm flex-1"
                placeholder="+880 17XX-XXXXXX"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
              />
              <Button size="sm" variant="outline" className="h-8 shrink-0">Send Test</Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5">
              <Settings2 className="size-3.5" />
              Save SMS Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp – Coming Soon */}
      <Card className="py-0 gap-0 opacity-60">
        <CardHeader className="px-5 py-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Smartphone className="size-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">WhatsApp Configuration</CardTitle>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">Coming Soon</Badge>
                </div>
                <CardDescription className="text-xs mt-0.5">Connect WhatsApp Business API (Meta)</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 py-4">
          <p className="text-sm text-muted-foreground">WhatsApp channel support is coming soon. You will be able to send rich messages, templates, and automated replies through the WhatsApp Business API.</p>
        </CardContent>
      </Card>

      {/* Email – Coming Soon */}
      <Card className="py-0 gap-0 opacity-60">
        <CardHeader className="px-5 py-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Mail className="size-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Email Configuration</CardTitle>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">Coming Soon</Badge>
                </div>
                <CardDescription className="text-xs mt-0.5">Configure SMTP or transactional email (SendGrid, Mailgun)</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 py-4">
          <p className="text-sm text-muted-foreground">Email channel support is coming soon. You will be able to send formatted emails, newsletters, and automated notifications via SMTP or transactional email providers.</p>
        </CardContent>
      </Card>

      {/* Default Communication Preferences */}
      <Card className="py-0 gap-0">
        <CardHeader className="px-5 py-4 border-b">
          <CardTitle className="text-sm font-semibold">Default Preferences</CardTitle>
          <CardDescription className="text-xs">Defaults applied when creating new campaigns or automations</CardDescription>
        </CardHeader>
        <CardContent className="px-5 py-4 space-y-4">
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Default Channel</Label>
            <Select value={defaultChannel} onValueChange={setDefaultChannel}>
              <SelectTrigger className="h-8 text-sm w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp" disabled>WhatsApp (Coming Soon)</SelectItem>
                <SelectItem value="email" disabled>Email (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-confirm payments</p>
                <p className="text-xs text-muted-foreground">Send a confirmation SMS when a payment is recorded</p>
              </div>
              <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto fee reminder</p>
                <p className="text-xs text-muted-foreground">Send a reminder SMS on the fee due date</p>
              </div>
              <Switch checked={autoReminder} onCheckedChange={setAutoReminder} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Send to guardians by default</p>
                <p className="text-xs text-muted-foreground">Target guardian numbers instead of student numbers</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm">Save Preferences</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Branding */}
      <Card className="py-0 gap-0">
        <CardHeader className="px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Notification Branding</CardTitle>
              <CardDescription className="text-xs mt-0.5">Customize how your academy appears in outgoing messages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Academy Logo</Label>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 border border-dashed border-primary/30">
                  <span className="text-sm font-bold text-primary">EF</span>
                </div>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                  <Upload className="size-3" />
                  Upload Logo
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Used in WhatsApp & Email headers (SMS is text-only)</p>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Brand Color</Label>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-md bg-primary border border-border" />
                <Input className="h-8 text-sm w-32" defaultValue="#2563EB" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Applied to email templates and WhatsApp cards</p>
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Sender Display Name</Label>
            <Input className="h-8 text-sm" defaultValue="Edu Flow Academy" />
            <p className="text-[10px] text-muted-foreground mt-1">How your academy name appears in email "From" field and WhatsApp business profile</p>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Reply-To Address</Label>
            <Input className="h-8 text-sm" defaultValue="no-reply@eduflow.app" />
            <p className="text-[10px] text-muted-foreground mt-1">Used in email channel (Coming Soon)</p>
          </div>
          <div className="flex justify-end">
            <Button size="sm">Save Branding</Button>
          </div>
        </CardContent>
      </Card>

      {/* Message Signature */}
      <Card className="py-0 gap-0">
        <CardHeader className="px-5 py-4 border-b">
          <CardTitle className="text-sm font-semibold">Message Signature</CardTitle>
          <CardDescription className="text-xs">Appended to messages when selected in the composer</CardDescription>
        </CardHeader>
        <CardContent className="px-5 py-4 space-y-3">
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Academy Name (for branding)</Label>
            <Input className="h-8 text-sm" defaultValue="Edu Flow Academy" />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Default Signature</Label>
            <Textarea
              className="text-sm resize-none"
              rows={3}
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">{signature.length} characters</p>
          </div>
          <div className="flex justify-end">
            <Button size="sm">Save Branding</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
