import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  Download,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
} from "lucide-react";

export default function Salary() {
  const { user } = useAuth();
  const db = getFirestore();
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [salaryStructure, setSalaryStructure] = useState({
    basic: 0,
    allowances: 0,
    deductions: 0
  });

  useEffect(() => {
    if (!user) return;

    // Fetch User Salary Structure
    const userUnsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Using currentSalary as Basic. In a real app, these would be separate fields.
        // We'll simulate allowances/deductions if they don't exist in the DB.
        const basic = data.currentSalary || 0;
        const allowances = data.allowances || Math.round(basic * 0.2);
        const deductions = data.deductions || Math.round(basic * 0.1);
        
        setSalaryStructure({
          basic,
          allowances,
          deductions
        });
      }
    });

    // Fetch Salary History
    const q = query(collection(db, "salary_records"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const historyUnsub = onSnapshot(q, (snapshot) => {
      setSalaryHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      userUnsub();
      historyUnsub();
    };
  }, [user, db]);

  const totalEarnings = salaryStructure.basic + salaryStructure.allowances;
  const totalDeductions = salaryStructure.deductions;
  const netSalary = totalEarnings - totalDeductions;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Salary & Payslips
            </h1>
            <p className="text-muted-foreground mt-1">
              View your salary details and download payslips
            </p>
          </div>
          <Select defaultValue="2024">
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold font-display text-success">
              ₹{totalEarnings.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">This month</p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Total Deductions
              </span>
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-3xl font-bold font-display text-destructive">
              ₹{totalDeductions.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">This month</p>
          </div>

          <div className="p-6 rounded-xl gradient-hero text-primary-foreground">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-primary-foreground/70">
                Net Salary
              </span>
              <IndianRupee className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold font-display">
              ₹{netSalary.toLocaleString()}
            </p>
            <p className="text-sm text-primary-foreground/70 mt-1">Take home</p>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="rounded-xl border bg-card shadow-card overflow-hidden">
            <div className="p-4 border-b bg-success/5">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Earnings
              </h3>
            </div>
            <div className="divide-y">
              <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <span className="text-muted-foreground">Basic Salary</span>
                <span className="font-medium text-foreground">₹{salaryStructure.basic.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <span className="text-muted-foreground">Allowances</span>
                <span className="font-medium text-foreground">₹{salaryStructure.allowances.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-success/5">
                <span className="font-semibold text-foreground">Total Earnings</span>
                <span className="font-bold text-success">
                  ₹{totalEarnings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="rounded-xl border bg-card shadow-card overflow-hidden">
            <div className="p-4 border-b bg-destructive/5">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                Deductions
              </h3>
            </div>
            <div className="divide-y">
              <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <span className="text-muted-foreground">Standard Deductions</span>
                <span className="font-medium text-destructive">-₹{salaryStructure.deductions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-destructive/5">
                <span className="font-semibold text-foreground">Total Deductions</span>
                <span className="font-bold text-destructive">
                  -₹{totalDeductions.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary History */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-display font-semibold text-lg">Salary History</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Month</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryHistory.map((record, index) => (
                <TableRow key={record.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{record.month}</TableCell>
                  <TableCell>₹{Number(record.basic).toLocaleString()}</TableCell>
                  <TableCell className="text-success">
                    +₹{Number(record.allowances).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-destructive">
                    -₹{Number(record.deductions).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-bold">
                    ₹{Number(record.netSalary).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <FileText className="w-4 h-4" />
                      Download
                    </Button>
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
