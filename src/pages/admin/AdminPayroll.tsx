import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Send } from "lucide-react";
import { toast } from "sonner";

const payrollData = [
  { id: 1, name: "Sarah Johnson", role: "Product Designer", basic: 35000, allowances: 10000, deductions: 2500, net: 42500, status: "Paid", date: "Jan 31, 2024" },
  { id: 2, name: "Michael Chen", role: "Senior Developer", basic: 45000, allowances: 12000, deductions: 3000, net: 54000, status: "Pending", date: "-" },
  { id: 3, name: "Emily Davis", role: "HR Manager", basic: 40000, allowances: 8000, deductions: 2000, net: 46000, status: "Processing", date: "-" },
  { id: 4, name: "James Wilson", role: "Marketing Lead", basic: 38000, allowances: 9000, deductions: 2200, net: 44800, status: "Paid", date: "Jan 31, 2024" },
];

export default function AdminPayroll() {
  const handleProcess = (id: number) => {
    toast.success("Payroll processed successfully");
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Payroll Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Process salaries and manage payslips for January 2024
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button variant="hero" className="gap-2">
              <Send className="w-4 h-4" />
              Process All
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Employee</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {item.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>₹{item.basic.toLocaleString()}</TableCell>
                  <TableCell className="text-success">+₹{item.allowances.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">-₹{item.deductions.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">₹{item.net.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        item.status === "Paid" ? "bg-success/10 text-success border-success/20" : 
                        item.status === "Pending" ? "bg-warning/10 text-warning border-warning/20" : 
                        "bg-primary/10 text-primary border-primary/20"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === "Pending" ? (
                      <Button size="sm" onClick={() => handleProcess(item.id)}>Process</Button>
                    ) : (
                      <Button size="sm" variant="ghost" disabled={item.status === "Processing"}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}