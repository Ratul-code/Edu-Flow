import * as React from "react"
import { Search, ChevronLeft, ChevronRight, AlertCircle, CreditCard, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNav } from "@/nav-context"

const ledger = [
  { student: "Rashed Karim", batch: "SSC Science A", expected: "৳3,000", paid: "৳0", due: "৳3,000", status: "overdue" },
  { student: "Nadia Islam", batch: "HSC Commerce B", expected: "৳2,500", paid: "৳0", due: "৳2,500", status: "due" },
  { student: "Tanvir Ahmed", batch: "SSC Arts C", expected: "৳2,000", paid: "৳1,000", due: "৳1,000", status: "partial" },
  { student: "Sadia Akter", batch: "Class 8 Math", expected: "৳1,800", paid: "৳1,800", due: "৳0", status: "paid" },
  { student: "Imran Hossain", batch: "SSC Science A", expected: "৳3,000", paid: "৳0", due: "৳3,000", status: "due" },
  { student: "Farida Begum", batch: "HSC Science A", expected: "৳4,000", paid: "৳4,000", due: "৳0", status: "paid" },
  { student: "Raihan Uddin", batch: "Class 9 Science", expected: "৳2,200", paid: "৳2,200", due: "৳0", status: "paid" },
  { student: "Mitu Khatun", batch: "SSC Commerce B", expected: "৳2,000", paid: "৳2,000", due: "৳0", status: "paid" },
  { student: "Arman Shaikh", batch: "HSC Science A", expected: "৳4,000", paid: "৳0", due: "৳4,000", status: "not_started" },
  { student: "Sumaiya Rahman", batch: "Class 8 Math", expected: "৳1,800", paid: "৳1,800", due: "৳0", status: "paid" },
  { student: "Shahidul Islam", batch: "SSC Science A", expected: "৳3,000", paid: "৳3,000", due: "৳0", status: "paid" },
  { student: "Rehana Parvin", batch: "HSC Commerce B", expected: "৳2,500", paid: "৳0", due: "৳0", status: "waived" },
]

function FeeStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive border-destructive/20" },
    due: { label: "Due", className: "bg-warning/10 text-warning-foreground border-warning/20" },
    partial: { label: "Partial", className: "bg-info/10 text-info border-info/20" },
    paid: { label: "Paid", className: "bg-success/10 text-success border-success/20" },
    not_started: { label: "Not Started", className: "bg-muted text-muted-foreground border-border" },
    waived: { label: "Waived", className: "bg-muted text-muted-foreground border-border" },
  }
  const c = map[status] ?? { label: status, className: "" }
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${c.className}`}>{c.label}</span>
}

export function Fees() {
  const { navigate } = useNav()
  const [search, setSearch] = React.useState("")

  const filtered = ledger.filter(
    (r) => r.student.toLowerCase().includes(search.toLowerCase()) || r.batch.toLowerCase().includes(search.toLowerCase())
  )

  const overdueCount = ledger.filter(r => r.status === "overdue").length
  const dueCount = ledger.filter(r => r.status === "due").length

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Student Fees</h1>
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                <AlertCircle className="size-3" />
                {overdueCount} overdue
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly fee ledger</p>
        </div>
        {/* Month controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm"><ChevronLeft className="size-3.5" /></Button>
          <span className="text-sm font-medium px-1 min-w-[90px] text-center">June 2025</span>
          <Button variant="outline" size="icon-sm" disabled><ChevronRight className="size-3.5" /></Button>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Expected", value: "৳1,85,000", className: "" },
          { label: "Collected", value: "৳1,42,500", className: "text-success" },
          { label: "Due", value: "৳42,500", className: "text-destructive" },
          { label: "Students Due", value: `${dueCount + overdueCount}`, className: "text-warning-foreground" },
        ].map(({ label, value, className }) => (
          <Card key={label} className="py-4 gap-2">
            <CardContent className="px-4 pt-0">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className={`text-xl font-bold tracking-tight ${className}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ledger Table */}
      <Card className="py-0 gap-0">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search student or batch..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger size="sm" className="w-[130px]">
                <SelectValue placeholder="All batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All batches</SelectItem>
                <SelectItem value="ssc-sci-a">SSC Science A</SelectItem>
                <SelectItem value="hsc-com-b">HSC Commerce B</SelectItem>
                <SelectItem value="class8">Class 8 Math</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger size="sm" className="w-[120px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="due">Due</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="waived">Waived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs h-9 font-medium pl-4">Student</TableHead>
                <TableHead className="text-xs h-9 font-medium">Batch / Fee Source</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Expected</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Paid</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Due</TableHead>
                <TableHead className="text-xs h-9 font-medium">Status</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.student}>
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px] font-semibold bg-muted">
                          {row.student.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{row.student}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground">{row.batch}</TableCell>
                  <TableCell className="py-3 text-sm text-right">{row.expected}</TableCell>
                  <TableCell className="py-3 text-sm font-medium text-right text-success">{row.paid === "৳0" ? <span className="text-muted-foreground font-normal">৳0</span> : row.paid}</TableCell>
                  <TableCell className="py-3 text-sm font-medium text-right">
                    {row.due === "৳0" ? <span className="text-muted-foreground font-normal">৳0</span> : <span className="text-destructive">{row.due}</span>}
                  </TableCell>
                  <TableCell className="py-3"><FeeStatusBadge status={row.status} /></TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center justify-end gap-1">
                      {row.status !== "paid" && row.status !== "waived" && (
                        <Button variant="outline" size="xs" className="gap-1" onClick={() => navigate("student-payment")}>
                          <CreditCard className="size-3" />
                          Pay
                        </Button>
                      )}
                      {(row.status === "paid" || row.status === "partial") && (
                        <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground">
                          <Receipt className="size-3" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <div className="border-t px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {ledger.length} entries</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" disabled><ChevronLeft className="size-3.5" /></Button>
            <Button variant="outline" size="icon-sm" className="size-7 text-xs">1</Button>
            <Button variant="ghost" size="icon-sm" className="size-7 text-xs">2</Button>
            <Button variant="outline" size="icon-sm"><ChevronRight className="size-3.5" /></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
