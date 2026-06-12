import { ArrowLeft, CheckCircle2, Receipt, Banknote, Smartphone, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNav } from "@/nav-context"

const recentPayments = [
  { date: "May 5, 2025", amount: "৳25,000", method: "Bank Transfer", ref: "SAL-202505-005" },
  { date: "Apr 3, 2025", amount: "৳25,000", method: "Bank Transfer", ref: "SAL-202504-005" },
  { date: "Mar 2, 2025", amount: "৳25,000", method: "Cash", ref: "SAL-202503-005" },
]

export function SalaryPayment() {
  const { navigate } = useNav()

  return (
    <div className="p-6 space-y-5">
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground mb-3 -ml-2" onClick={() => navigate("salaries")}>
          <ArrowLeft className="size-3.5" />
          Back to Salaries
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Record Salary Payment</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Record a salary disbursement for a teacher</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Salary Summary */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold">Salary Summary</CardTitle>
              <CardDescription className="text-xs mt-0.5">June 2025</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="size-10">
                  <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">FA</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Dr. Farhan Ali</div>
                  <div className="text-sm text-muted-foreground">01711-111222 · Physics, Chemistry</div>
                </div>
                <span className="ml-auto inline-flex items-center rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-foreground">Due</span>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-4">
                <div><div className="text-xs text-muted-foreground">Expected</div><div className="text-lg font-bold">৳25,000</div></div>
                <div><div className="text-xs text-muted-foreground">Previously Paid</div><div className="text-lg font-bold text-success">৳0</div></div>
                <div><div className="text-xs text-muted-foreground">Due Amount</div><div className="text-lg font-bold text-destructive">৳25,000</div></div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Amount (৳)</Label>
                  <Input defaultValue="25000" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Payment Date</Label>
                  <Input type="date" defaultValue="2025-06-07" className="h-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Payment Method</Label>
                <Select defaultValue="bank">
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash"><span className="flex items-center gap-2"><Banknote className="size-3.5" /> Cash</span></SelectItem>
                    <SelectItem value="bkash"><span className="flex items-center gap-2"><Smartphone className="size-3.5" /> bKash</span></SelectItem>
                    <SelectItem value="bank"><span className="flex items-center gap-2"><CreditCard className="size-3.5" /> Bank Transfer</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Reference / Transaction ID</Label>
                <Input placeholder="Bank ref / cheque number" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Notes</Label>
                <Textarea placeholder="Optional notes..." className="min-h-[70px] resize-none text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="gap-1.5 flex-1"><CheckCircle2 className="size-4" />Record Salary Payment</Button>
                <Button variant="outline" className="gap-1.5"><Receipt className="size-4" />Print Receipt</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <div>
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold">Payment History</CardTitle>
              <CardDescription className="text-xs mt-0.5">Last 3 salary payments</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pt-2 space-y-3">
              {recentPayments.map((p) => (
                <div key={p.ref} className="flex items-center justify-between rounded-lg border p-2.5">
                  <div>
                    <div className="text-sm font-medium">{p.amount}</div>
                    <div className="text-xs text-muted-foreground">{p.date} · {p.method}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.ref}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Paid</span>
                    <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground h-6">
                      <Receipt className="size-3" />
                      Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
