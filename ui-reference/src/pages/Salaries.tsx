import * as React from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Banknote } from "lucide-react"
import { useNav } from "@/nav-context"

const salaryLedger = [
  { teacher: "Dr. Farhan Ali", expected: "৳25,000", paid: "৳0", due: "৳25,000", status: "due" },
  { teacher: "Mst. Rina Begum", expected: "৳18,000", paid: "৳18,000", due: "৳0", status: "paid" },
  { teacher: "Md. Kamal Uddin", expected: "৳20,000", paid: "৳20,000", due: "৳0", status: "paid" },
  { teacher: "Ms. Taslima Khatun", expected: "৳16,000", paid: "৳8,000", due: "৳8,000", status: "partial" },
  { teacher: "Ms. Ritu Das", expected: "৳18,000", paid: "৳18,000", due: "৳0", status: "paid" },
  { teacher: "Md. Jahangir Alam", expected: "৳0", paid: "৳0", due: "৳0", status: "not_started" },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    due: { label: "Due", className: "bg-warning/10 text-warning-foreground border-warning/20" },
    partial: { label: "Partial", className: "bg-info/10 text-info border-info/20" },
    paid: { label: "Paid", className: "bg-success/10 text-success border-success/20" },
    not_started: { label: "Not Started", className: "bg-muted text-muted-foreground border-border" },
  }
  const c = map[status] ?? { label: status, className: "" }
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${c.className}`}>{c.label}</span>
}

export function Salaries() {
  const { navigate } = useNav()
  const [search, setSearch] = React.useState("")
  const filtered = salaryLedger.filter(r => r.teacher.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Teacher Salaries</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly salary ledger</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm"><ChevronLeft className="size-3.5" /></Button>
          <span className="text-sm font-medium px-1 min-w-[90px] text-center">June 2025</span>
          <Button variant="outline" size="icon-sm" disabled><ChevronRight className="size-3.5" /></Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Payroll", value: "৳97,000", className: "" },
          { label: "Paid", value: "৳64,000", className: "text-success" },
          { label: "Pending", value: "৳33,000", className: "text-destructive" },
          { label: "Teachers Due", value: "2", className: "text-warning-foreground" },
        ].map(({ label, value, className }) => (
          <Card key={label} className="py-4 gap-2">
            <CardContent className="px-4 pt-0">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className={`text-xl font-bold tracking-tight ${className}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="py-0 gap-0">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search teacher..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger size="sm" className="w-[120px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="due">Due</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs h-9 font-medium pl-4">Teacher</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Expected Salary</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Paid</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Due</TableHead>
                <TableHead className="text-xs h-9 font-medium">Status</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.teacher}>
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px] font-semibold bg-muted">
                          {row.teacher.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{row.teacher}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-right">{row.expected}</TableCell>
                  <TableCell className="py-3 text-sm font-medium text-right text-success">{row.paid === "৳0" ? <span className="text-muted-foreground font-normal">৳0</span> : row.paid}</TableCell>
                  <TableCell className="py-3 text-sm font-medium text-right">
                    {row.due === "৳0" ? <span className="text-muted-foreground font-normal">৳0</span> : <span className="text-destructive">{row.due}</span>}
                  </TableCell>
                  <TableCell className="py-3"><StatusBadge status={row.status} /></TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center justify-end">
                      {row.status !== "paid" && row.status !== "not_started" && (
                        <Button variant="outline" size="xs" className="gap-1" onClick={() => navigate("salary-payment")}>
                          <Banknote className="size-3" />
                          Pay
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
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {salaryLedger.length} teachers</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" disabled><ChevronLeft className="size-3.5" /></Button>
            <Button variant="outline" size="icon-sm" className="size-7 text-xs">1</Button>
            <Button variant="outline" size="icon-sm"><ChevronRight className="size-3.5" /></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
