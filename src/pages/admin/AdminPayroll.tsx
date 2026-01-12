import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Send } from "lucide-react";
import { toast } from "sonner";
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { format } from "date-fns";

export default function AdminPayroll() {
  const db = getFirestore();
  const [users, setUsers] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [db]);

  useEffect(() => {
    const currentMonth = format(new Date(), "MMMM yyyy");
    const q = query(collection(db, "salary_records"), where("month", "==", currentMonth));
    const unsub = onSnapshot(q, snap => {
      setRecords(snap.docs.map(d => d.data()));
    });
    return () => unsub();
  }, [db]);

  const payrollData = users.map(user => {
    const record = records.find((r: any) => r.userId === user.id);
    const basic = Number(user.currentSalary) || 0;
    const allowances = Number(user.allowances) || Math.round(basic * 0.2);
    const deductions = Number(user.deductions) || Math.round(basic * 0.1);
    const net = basic + allowances - deductions;

    return {
      id: user.id,
      name: user.displayName || user.email,
      role: user.role || "Employee",
      basic,
      allowances,
      deductions,
      net,
      status: record ? "Paid" : "Pending",
      date: record ? new Date(record.createdAt?.seconds * 1000).toLocaleDateString() : "-",
    };
  });

  const handleProcess = async (employee: any) => {
    setLoading(true);
    try {
      const currentMonth = format(new Date(), "MMMM yyyy");
      
      await addDoc(collection(db, "salary_records"), {
        userId: employee.id,
        userName: employee.name,
        month: currentMonth,
        basic: employee.basic,
        allowances: employee.allowances,
        deductions: employee.deductions,
        netSalary: employee.net,
        status: "Paid",
        createdAt: serverTimestamp()
      });

      toast.success(`Payroll processed for ${employee.name}`);
    } catch (error) {
      toast.error("Failed to process payroll");
    } finally {
      setLoading(false);
    }
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
              Process salaries and manage payslips for {format(new Date(), "MMMM yyyy")}
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
                          {item.name?.substring(0, 2).toUpperCase() || "US"}
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
                      <Button size="sm" onClick={() => handleProcess(item)} disabled={loading}>Process</Button>
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