import { Building2, CreditCard, BookOpen, Users, Plus, Pencil, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const classLevels = ["Class 6", "Class 7", "Class 8", "Class 9", "SSC", "HSC", "Degree"]
const academicGroups = ["Science", "Commerce", "Arts", "General"]
const mediums = ["Bangla Medium", "English Medium", "English Version"]

export function Settings() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your center configuration and preferences</p>
      </div>

      <Tabs defaultValue="general" className="gap-4">
        <TabsList variant="line" className="h-auto border-b pb-0 rounded-none w-full justify-start gap-0 px-0">
          <TabsTrigger value="general" className="rounded-none px-4">General</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-none px-4">Billing</TabsTrigger>
          <TabsTrigger value="taxonomy" className="rounded-none px-4">Academic Setup</TabsTrigger>
          <TabsTrigger value="salary" className="rounded-none px-4">Salary Settings</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Center Profile */}
            <Card className="gap-4 py-5">
              <CardHeader className="px-5 pb-0 pt-0">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Center Profile</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pt-2 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
                    EF
                  </div>
                  <div>
                    <p className="text-sm font-medium">Edu Flow Academy</p>
                    <p className="text-xs text-muted-foreground">logo.png</p>
                    <Button variant="outline" size="xs" className="mt-1.5 text-xs">Change Logo</Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  {[
                    { label: "Center Name", value: "Edu Flow Academy" },
                    { label: "Address", value: "House 12, Road 5, Mirpur-10, Dhaka" },
                    { label: "Phone", value: "01711-000000" },
                    { label: "Email", value: "info@eduflow.app" },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1.5">
                      <Label className="text-xs font-medium">{label}</Label>
                      <Input defaultValue={value} className="h-8 text-sm" />
                    </div>
                  ))}
                </div>
                <Button size="sm" className="gap-1.5 w-full"><Save className="size-3.5" />Save Profile</Button>
              </CardContent>
            </Card>

            {/* Admin Account */}
            <Card className="gap-4 py-5">
              <CardHeader className="px-5 pb-0 pt-0">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Admin Account</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pt-2 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">AR</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">Arif Rahman</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  {[
                    { label: "Full Name", value: "Arif Rahman" },
                    { label: "Email", value: "arif@eduflow.app" },
                    { label: "Phone", value: "01711-999888" },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1.5">
                      <Label className="text-xs font-medium">{label}</Label>
                      <Input defaultValue={value} className="h-8 text-sm" />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">New Password</Label>
                  <Input type="password" placeholder="Leave blank to keep current" className="h-8 text-sm" />
                </div>
                <Button size="sm" className="gap-1.5 w-full"><Save className="size-3.5" />Update Account</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="gap-4 py-5">
              <CardHeader className="px-5 pb-0 pt-0">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Billing Settings</CardTitle>
                </div>
                <CardDescription className="text-xs mt-0.5">Configure fee billing and due date rules</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Billing Cycle Start Day</Label>
                  <Select defaultValue="1">
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st of every month</SelectItem>
                      <SelectItem value="5">5th of every month</SelectItem>
                      <SelectItem value="10">10th of every month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Fee Due Date (days after billing start)</Label>
                  <Input defaultValue="15" className="h-8 text-sm" type="number" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Late Fee (৳)</Label>
                  <Input defaultValue="200" className="h-8 text-sm" type="number" />
                </div>
                <Separator />
                <div className="space-y-3">
                  {[
                    { label: "Auto-generate monthly ledger", checked: true },
                    { label: "Send fee reminder on due date", checked: true },
                    { label: "Enable late fee after grace period", checked: false },
                    { label: "Allow partial payments", checked: true },
                  ].map(({ label, checked }) => (
                    <div key={label} className="flex items-center justify-between">
                      <Label className="text-sm font-normal cursor-pointer">{label}</Label>
                      <Switch defaultChecked={checked} />
                    </div>
                  ))}
                </div>
                <Button size="sm" className="gap-1.5 w-full"><Save className="size-3.5" />Save Billing Settings</Button>
              </CardContent>
            </Card>

            <Card className="gap-4 py-5">
              <CardHeader className="px-5 pb-0 pt-0">
                <CardTitle className="text-sm font-semibold">Payment Methods</CardTitle>
                <CardDescription className="text-xs mt-0.5">Configure accepted payment channels</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pt-2 space-y-3">
                {[
                  { method: "Cash", desc: "In-person cash payment", enabled: true },
                  { method: "bKash", desc: "Mobile banking (01711-000000)", enabled: true },
                  { method: "Nagad", desc: "Mobile banking", enabled: true },
                  { method: "Bank Transfer", desc: "Dutch-Bangla Bank", enabled: false },
                  { method: "Rocket", desc: "Mobile banking", enabled: false },
                ].map(({ method, desc, enabled }) => (
                  <div key={method} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="text-sm font-medium">{method}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                    <Switch defaultChecked={enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Taxonomy Tab */}
        <TabsContent value="taxonomy" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Class Levels */}
            <Card className="gap-4 py-5">
              <CardHeader className="px-5 pb-0 pt-0 flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold">Class Levels</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-0.5">{classLevels.length} levels configured</CardDescription>
                </div>
                <Button variant="outline" size="icon-sm" className="size-7"><Plus className="size-3.5" /></Button>
              </CardHeader>
              <CardContent className="px-5 pt-2 space-y-1.5">
                {classLevels.map((level) => (
                  <div key={level} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">{level}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" className="size-6"><Pencil className="size-3" /></Button>
                      <Button variant="ghost" size="icon-sm" className="size-6 text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /></Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <Input placeholder="New class level..." className="h-7 text-xs flex-1" />
                  <Button size="sm" className="h-7 px-2 text-xs">Add</Button>
                </div>
              </CardContent>
            </Card>

            {/* Academic Groups */}
            <Card className="gap-4 py-5">
              <CardHeader className="px-5 pb-0 pt-0 flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold">Academic Groups</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-0.5">{academicGroups.length} groups configured</CardDescription>
                </div>
                <Button variant="outline" size="icon-sm" className="size-7"><Plus className="size-3.5" /></Button>
              </CardHeader>
              <CardContent className="px-5 pt-2 space-y-1.5">
                {academicGroups.map((group) => (
                  <div key={group} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">{group}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" className="size-6"><Pencil className="size-3" /></Button>
                      <Button variant="ghost" size="icon-sm" className="size-6 text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /></Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <Input placeholder="New group..." className="h-7 text-xs flex-1" />
                  <Button size="sm" className="h-7 px-2 text-xs">Add</Button>
                </div>
              </CardContent>
            </Card>

            {/* Mediums */}
            <Card className="gap-4 py-5">
              <CardHeader className="px-5 pb-0 pt-0 flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold">Mediums</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-0.5">{mediums.length} mediums configured</CardDescription>
                </div>
                <Button variant="outline" size="icon-sm" className="size-7"><Plus className="size-3.5" /></Button>
              </CardHeader>
              <CardContent className="px-5 pt-2 space-y-1.5">
                {mediums.map((medium) => (
                  <div key={medium} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">{medium}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" className="size-6"><Pencil className="size-3" /></Button>
                      <Button variant="ghost" size="icon-sm" className="size-6 text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /></Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <Input placeholder="New medium..." className="h-7 text-xs flex-1" />
                  <Button size="sm" className="h-7 px-2 text-xs">Add</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Salary Settings Tab */}
        <TabsContent value="salary" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="gap-4 py-5">
              <CardHeader className="px-5 pb-0 pt-0">
                <CardTitle className="text-sm font-semibold">Teacher Payment Settings</CardTitle>
                <CardDescription className="text-xs mt-0.5">Configure salary cycle and notification rules</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Salary Payment Day</Label>
                  <Select defaultValue="5">
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st of every month</SelectItem>
                      <SelectItem value="5">5th of every month</SelectItem>
                      <SelectItem value="10">10th of every month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Default Payment Method</Label>
                  <Select defaultValue="bank">
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="bkash">bKash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-3">
                  {[
                    { label: "Auto-generate monthly salary ledger", checked: true },
                    { label: "Send salary reminder to admin", checked: true },
                    { label: "Allow partial salary disbursement", checked: true },
                  ].map(({ label, checked }) => (
                    <div key={label} className="flex items-center justify-between">
                      <Label className="text-sm font-normal cursor-pointer">{label}</Label>
                      <Switch defaultChecked={checked} />
                    </div>
                  ))}
                </div>
                <Button size="sm" className="gap-1.5 w-full"><Save className="size-3.5" />Save Salary Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
