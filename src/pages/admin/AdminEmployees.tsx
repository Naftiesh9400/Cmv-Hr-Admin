import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, MoreVertical, Mail, Phone } from "lucide-react";

const employees = [
  { id: 1, name: "Sarah Johnson", role: "Product Designer", email: "sarah@company.com", phone: "+1 234 567 890", status: "Active", department: "Design", joinDate: "Jan 15, 2023" },
  { id: 2, name: "Michael Chen", role: "Senior Developer", email: "michael@company.com", phone: "+1 234 567 891", status: "Active", department: "Engineering", joinDate: "Feb 01, 2023" },
  { id: 3, name: "Emily Davis", role: "HR Manager", email: "emily@company.com", phone: "+1 234 567 892", status: "On Leave", department: "HR", joinDate: "Mar 10, 2023" },
  { id: 4, name: "James Wilson", role: "Marketing Lead", email: "james@company.com", phone: "+1 234 567 893", status: "Active", department: "Marketing", joinDate: "Apr 05, 2023" },
  { id: 5, name: "Lisa Anderson", role: "Frontend Dev", email: "lisa@company.com", phone: "+1 234 567 894", status: "Inactive", department: "Engineering", joinDate: "May 20, 2023" },
];

export default function AdminEmployees() {
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
            <Input placeholder="Search employees..." className="pl-9 bg-background" />
          </div>
        </div>

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
              {employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {employee.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">ID: EMP-{employee.id.toString().padStart(3, '0')}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{employee.role}</p>
                    <p className="text-xs text-muted-foreground">{employee.department}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="w-3 h-3" /> {employee.email}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3 h-3" /> {employee.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={employee.status === "Active" ? "bg-success/10 text-success border-success/20" : employee.status === "Inactive" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"}>{employee.status}</Badge>
                  </TableCell>
                  <TableCell>{employee.joinDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
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