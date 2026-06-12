import {
  ArrowLeft,
  Pencil,
  Archive,
  Phone,
  Calendar,
  BookOpen,
  Tag,
  User,
  CreditCard,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useNav } from "@/nav-context"

const feeHistory = [
  { month: "June 2025", batch: "SSC Science A", expected: "৳3,000", paid: "৳0", due: "৳3,000", status: "overdue" },
  { month: "May 2025", batch: "SSC Science A", expected: "৳3,000", paid: "৳3,000", due: "৳0", status: "paid" },
  { month: "April 2025", batch: "SSC Science A", expected: "৳3,000", paid: "৳1,500", due: "৳1,500", status: "partial" },
  { month: "March 2025", batch: "SSC Science A", expected: "৳3,000", paid: "৳3,000", due: "৳0", status: "paid" },
  { month: "February 2025", batch: "SSC Science A", expected: "৳3,000", paid: "৳3,000", due: "৳0", status: "paid" },
]

function FeeStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive border-destructive/20" },
    due: { label: "Due", className: "bg-warning/10 text-warning-foreground border-warning/20" },
    partial: { label: "Partial", className: "bg-info/10 text-info border-info/20" },
    paid: { label: "Paid", className: "bg-success/10 text-success border-success/20" },
    waived: { label: "Waived", className: "bg-muted text-muted-foreground border-border" },
  }
  const config = map[status] ?? { label: status, className: "" }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export function StudentDetail() {
  const { navigate } = useNav()

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground mb-3 -ml-2"
          onClick={() => navigate("students")}
        >
          <ArrowLeft className="size-3.5" />
          Back to Students
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">RK</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">Rashed Karim</h1>
                <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
                <span className="inline-flex items-center rounded-full border border-info/20 bg-info/10 px-2 py-0.5 text-xs font-medium text-info">Scholarship</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Student ID: STU-2024-0042</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="size-3.5" />
              Edit Student
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
              <Archive className="size-3.5" />
              Archive
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => navigate("student-payment")}>
              <CreditCard className="size-3.5" />
              Record Payment
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
              { icon: Phone, label: "Phone", value: "01711-234567" },
              { icon: BookOpen, label: "Class Level", value: "SSC" },
              { icon: User, label: "Medium", value: "Bangla Medium" },
              { icon: User, label: "Group", value: "Science" },
              { icon: User, label: "Institution", value: "Dhaka Govt. High School" },
              { icon: Calendar, label: "Admission Date", value: "January 15, 2024" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <Icon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-sm font-medium">{value}</div>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex items-start gap-2.5">
              <Tag className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">scholarship</Badge>
                  <Badge variant="secondary" className="text-xs">science</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {/* Guardian Card */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold">Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-0">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Father's Name", value: "Abdul Karim" },
                  { label: "Mother's Name", value: "Rahima Begum" },
                  { label: "Guardian Phone", value: "01811-234567" },
                  { label: "Relationship", value: "Father" },
                  { label: "Occupation", value: "Business" },
                  { label: "Address", value: "Mirpur-10, Dhaka" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-medium mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Batches */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0 flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Enrolled Batches</CardTitle>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <BookOpen className="size-3" />
                Assign Batch
              </Button>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="space-y-2">
                {[
                  { name: "SSC Science A", subject: "Physics, Chemistry, Biology", fee: "৳3,000/month", status: "active" },
                ].map((batch) => (
                  <div key={batch.name} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                        <BookOpen className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{batch.name}</div>
                        <div className="text-xs text-muted-foreground">{batch.subject}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{batch.fee}</span>
                      <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fee History */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Fee History</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Total paid: ৳12,000 · Outstanding: ৳4,500
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("student-payment")}>
                  Record Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 font-medium">Month</TableHead>
                    <TableHead className="text-xs h-8 font-medium">Batch</TableHead>
                    <TableHead className="text-xs h-8 font-medium text-right">Expected</TableHead>
                    <TableHead className="text-xs h-8 font-medium text-right">Paid</TableHead>
                    <TableHead className="text-xs h-8 font-medium text-right">Due</TableHead>
                    <TableHead className="text-xs h-8 font-medium">Status</TableHead>
                    <TableHead className="h-8 w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeHistory.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="py-2.5 text-sm font-medium">{row.month}</TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground">{row.batch}</TableCell>
                      <TableCell className="py-2.5 text-sm text-right">{row.expected}</TableCell>
                      <TableCell className="py-2.5 text-sm text-right font-medium text-success">{row.paid}</TableCell>
                      <TableCell className="py-2.5 text-sm text-right font-medium text-destructive">{row.due}</TableCell>
                      <TableCell className="py-2.5">
                        <FeeStatusBadge status={row.status} />
                      </TableCell>
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
                placeholder="Add notes about this student..."
                className="min-h-[80px] text-sm resize-none"
                defaultValue="Student is very attentive in class. Needs extra help with organic chemistry. Parents contacted on 2025-05-12 regarding partial payment."
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
