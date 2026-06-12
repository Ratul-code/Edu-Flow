import { ArrowLeft, Pencil, Archive, Phone, BookOpen, Banknote, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useNav } from "@/nav-context"

const salaryHistory = [
  { month: "June 2025", expected: "৳25,000", paid: "৳0", due: "৳25,000", status: "due" },
  { month: "May 2025", expected: "৳25,000", paid: "৳25,000", due: "৳0", status: "paid" },
  { month: "April 2025", expected: "৳25,000", paid: "৳25,000", due: "৳0", status: "paid" },
  { month: "March 2025", expected: "৳25,000", paid: "৳25,000", due: "৳0", status: "paid" },
  { month: "February 2025", expected: "৳25,000", paid: "৳20,000", due: "৳5,000", status: "partial" },
]

function SalaryStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    due: { label: "Due", className: "bg-warning/10 text-warning-foreground border-warning/20" },
    partial: { label: "Partial", className: "bg-info/10 text-info border-info/20" },
    paid: { label: "Paid", className: "bg-success/10 text-success border-success/20" },
  }
  const c = map[status] ?? { label: status, className: "" }
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${c.className}`}>{c.label}</span>
}

export function TeacherDetail() {
  const { navigate } = useNav()

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground mb-3 -ml-2" onClick={() => navigate("teachers")}>
          <ArrowLeft className="size-3.5" />
          Back to Teachers
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">FA</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">Dr. Farhan Ali</h1>
                <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Teacher ID: TCH-2023-0005</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="size-3.5" />Edit Teacher</Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive"><Archive className="size-3.5" />Archive</Button>
            <Button size="sm" className="gap-1.5" onClick={() => navigate("salary-payment")}>
              <Banknote className="size-3.5" />
              Record Salary
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <Card className="gap-4 py-5">
          <CardHeader className="px-5 pb-0 pt-0">
            <CardTitle className="text-sm font-semibold">Profile</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pt-0 space-y-3">
            {[
              { icon: Phone, label: "Phone", value: "01711-111222" },
              { icon: BookOpen, label: "Subject Specialty", value: "Physics, Chemistry" },
              { icon: BookOpen, label: "Assigned Batches", value: "3 active batches" },
              { icon: Banknote, label: "Default Monthly Salary", value: "৳25,000" },
              { icon: Banknote, label: "Joined Date", value: "June 10, 2023" },
              { icon: Phone, label: "Email", value: "farhan.ali@edu.com" },
              { icon: Phone, label: "NID", value: "1234567890123" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <Icon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-sm font-medium">{value}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {/* Salary Baseline Card */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold">Salary Baseline</CardTitle>
              <CardDescription className="text-xs mt-0.5">Configure the expected salary for each month</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Base Salary", value: "৳25,000", desc: "Per month" },
                  { label: "Total Paid (2025)", value: "৳95,000", desc: "5 months" },
                  { label: "Total Due (2025)", value: "৳30,000", desc: "2 months pending" },
                ].map(({ label, value, desc }) => (
                  <div key={label} className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-xl font-bold mt-0.5">{value}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Salary History */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Salary History</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Total paid: ৳95,000 · Outstanding: ৳30,000</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("salary-payment")}>
                  Record Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 font-medium">Month</TableHead>
                    <TableHead className="text-xs h-8 font-medium text-right">Expected</TableHead>
                    <TableHead className="text-xs h-8 font-medium text-right">Paid</TableHead>
                    <TableHead className="text-xs h-8 font-medium text-right">Due</TableHead>
                    <TableHead className="text-xs h-8 font-medium">Status</TableHead>
                    <TableHead className="h-8 w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryHistory.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="py-2.5 text-sm font-medium">{row.month}</TableCell>
                      <TableCell className="py-2.5 text-sm text-right">{row.expected}</TableCell>
                      <TableCell className="py-2.5 text-sm font-medium text-right text-success">{row.paid}</TableCell>
                      <TableCell className="py-2.5 text-sm font-medium text-right text-destructive">{row.due}</TableCell>
                      <TableCell className="py-2.5"><SalaryStatusBadge status={row.status} /></TableCell>
                      <TableCell className="py-2.5">
                        <Button variant="ghost" size="icon-sm" className="size-6">
                          <FileText className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold">Notes</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <Textarea
                placeholder="Add notes about this teacher..."
                className="min-h-[80px] text-sm resize-none"
                defaultValue="Excellent teacher with 10+ years experience. Students consistently score higher in Physics. Requested salary revision from July 2025."
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" variant="outline">Save Note</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
