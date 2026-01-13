import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, MoreVertical, Mail, Phone, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminEmployees() {
  const db = getFirestore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    casualLeave: 0,
    sickLeave: 0,
    paidLeave: 0,
    wfh: 0,
    salary: 0,
    performanceScore: 0,
    performanceTrend: 0,
    dob: "",
    joinDate: ""
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleEditClick = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      casualLeave: employee.leaveBalance?.casual || 0,
      sickLeave: employee.leaveBalance?.sick || 0,
      paidLeave: employee.leaveBalance?.paid || 0,
      wfh: employee.leaveBalance?.wfh || 0,
      salary: employee.currentSalary || 0,
      performanceScore: employee.performance?.score || 0,
      performanceTrend: employee.performance?.trend || 0,
      dob: employee.dob || "",
      joinDate: employee.joinDate || ""
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingEmployee) return;
    try {
      await updateDoc(doc(db, "users", editingEmployee.id), {
        leaveBalance: {
          casual: Number(formData.casualLeave),
          sick: Number(formData.sickLeave),
          paid: Number(formData.paidLeave),
          wfh: Number(formData.wfh)
        },
        currentSalary: Number(formData.salary),
        performance: {
          score: Number(formData.performanceScore),
          trend: Number(formData.performanceTrend)
        },
        dob: formData.dob,
        joinDate: formData.joinDate // Ensure joinDate is saved
      });
      toast.success("Employee stats updated successfully");
      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee stats");
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Employees
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization's workforce
            </p>
          </div>
          <Button variant="hero" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Button>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Employee Stats</DialogTitle>
              <DialogDescription>
                Update salary, leave balance, and performance metrics for {editingEmployee?.displayName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="casual">Casual Leave</Label>
                  <Input id="casual" type="number" value={formData.casualLeave} onChange={(e) => setFormData({...formData, casualLeave: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sick">Sick Leave</Label>
                  <Input id="sick" type="number" value={formData.sickLeave} onChange={(e) => setFormData({...formData, sickLeave: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paid">Paid Leave</Label>
                  <Input id="paid" type="number" value={formData.paidLeave} onChange={(e) => setFormData({...formData, paidLeave: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wfh">Work from Home</Label>
                  <Input id="wfh" type="number" value={formData.wfh} onChange={(e) => setFormData({...formData, wfh: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input id="edit-dob" type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="edit-joinDate">Joining Date</Label>
                  <Input id="edit-joinDate" type="date" value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Current Month Net Salary (₹)</Label>
                <Input id="salary" type="number" value={formData.salary} onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Performance Score (%)</Label>
                  <Input id="score" type="number" value={formData.performanceScore} onChange={(e) => setFormData({...formData, performanceScore: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trend">Trend vs Last Month (%)</Label>
                  <Input id="trend" type="number" value={formData.performanceTrend} onChange={(e) => setFormData({...formData, performanceTrend: Number(e.target.value)})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Employee</TableHead>
                <TableHead>Role & Dept</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {employee.displayName?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.displayName}</p>
                        <p className="text-xs text-muted-foreground">ID: {employee.id.substring(0, 6)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{employee.role || "Employee"}</p>
                    <p className="text-xs text-muted-foreground">{employee.department || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="w-3 h-3" /> {employee.email}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3 h-3" /> {employee.phone || "-"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>
                  </TableCell>
                  <TableCell>{employee.lastLogin ? new Date(employee.lastLogin.seconds * 1000).toLocaleDateString() : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(employee)}>
                      <Pencil className="w-4 h-4" />
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