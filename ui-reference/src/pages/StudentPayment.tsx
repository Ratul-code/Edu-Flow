import { ArrowLeft, CreditCard, Banknote, Smartphone, Receipt, CheckCircle2 } from "lucide-react"
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
  { date: "May 5, 2025", amount: "৳3,000", method: "bKash", ref: "TXN-202505-001", status: "paid" },
  { date: "Apr 3, 2025", amount: "৳1,500", method: "Cash", ref: "TXN-202504-001", status: "partial" },
  { date: "Mar 2, 2025", amount: "৳3,000", method: "bKash", ref: "TXN-202503-001", status: "paid" },
]

export function StudentPayment() {
  const { navigate } = useNav()

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground mb-3 -ml-2" onClick={() => navigate("fees")}>
          <ArrowLeft className="size-3.5" />
          Back to Fees
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Record Payment</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Record a fee payment for a student</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ledger Summary */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold">Ledger Summary</CardTitle>
              <CardDescription className="text-xs mt-0.5">June 2025 — SSC Science A</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="size-10">
                  <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">RK</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Rashed Karim</div>
                  <div className="text-sm text-muted-foreground">01711-234567 · SSC Science A</div>
                </div>
                <span className="ml-auto inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Overdue</span>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Expected</div>
                  <div className="text-lg font-bold">৳3,000</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Previously Paid</div>
                  <div className="text-lg font-bold text-success">৳0</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Due Amount</div>
                  <div className="text-lg font-bold text-destructive">৳3,000</div>
                </div>
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
                  <Input defaultValue="3000" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Payment Date</Label>
                  <Input type="date" defaultValue="2025-06-07" className="h-9" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Payment Method</Label>
                <Select defaultValue="bkash">
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <span className="flex items-center gap-2"><Banknote className="size-3.5" /> Cash</span>
                    </SelectItem>
                    <SelectItem value="bkash">
                      <span className="flex items-center gap-2"><Smartphone className="size-3.5" /> bKash</span>
                    </SelectItem>
                    <SelectItem value="nagad">
                      <span className="flex items-center gap-2"><Smartphone className="size-3.5" /> Nagad</span>
                    </SelectItem>
                    <SelectItem value="bank">
                      <span className="flex items-center gap-2"><CreditCard className="size-3.5" /> Bank Transfer</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Transaction Reference (optional)</Label>
                <Input placeholder="e.g. bKash TXN ID" className="h-9" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Notes (optional)</Label>
                <Textarea placeholder="Add any notes about this payment..." className="min-h-[80px] resize-none text-sm" />
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="gap-1.5 flex-1">
                  <CheckCircle2 className="size-4" />
                  Record Payment
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <Receipt className="size-4" />
                  Save & Print Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Payments */}
        <div className="space-y-4">
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold">Recent Payments</CardTitle>
              <CardDescription className="text-xs mt-0.5">Last 3 transactions</CardDescription>
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
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${p.status === "paid" ? "bg-success/10 text-success border-success/20" : "bg-info/10 text-info border-info/20"}`}>
                      {p.status === "paid" ? "Paid" : "Partial"}
                    </span>
                    <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground h-6">
                      <Receipt className="size-3" />
                      Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Receipt Preview */}
          <Card className="gap-4 py-5 border-dashed">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Receipt className="size-3.5" />
                Receipt Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="rounded-lg border bg-muted/30 p-4 text-xs space-y-2">
                <div className="text-center font-bold text-sm">Edu Flow</div>
                <div className="text-center text-muted-foreground">Fee Receipt</div>
                <Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-medium">Rashed Karim</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Month</span><span className="font-medium">June 2025</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Batch</span><span className="font-medium">SSC Science A</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">bKash</span></div>
                <Separator />
                <div className="flex justify-between font-bold"><span>Amount Paid</span><span>৳3,000</span></div>
                <div className="text-center text-muted-foreground pt-1">Thank you!</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
