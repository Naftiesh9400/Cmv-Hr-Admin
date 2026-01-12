import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Clock,
  Calendar,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserPlus,
  Download,
} from "lucide-react";

const pendingApprovals = [
  {
    id: 1,
    type: "leave",
    employee: "Sarah Johnson",
    avatar: "",
    initials: "SJ",
    request: "Casual Leave - Jan 20-21",
    submittedAt: "2 hours ago",
  },
  {
    id: 2,
    type: "increment",
    employee: "Mike Chen",
    avatar: "",
    initials: "MC",
    request: "Salary Increment Request",
    submittedAt: "1 day ago",
  },
  {
    id: 3,
    type: "leave",
    employee: "Emily Davis",
    avatar: "",
    initials: "ED",
    request: "Work from Home - Jan 25-26",
    submittedAt: "3 hours ago",
  },
];

const todayAttendance = [
  { name: "Present", count: 42, color: "bg-success" },
  { name: "Late", count: 5, color: "bg-warning" },
  { name: "Absent", count: 3, color: "bg-destructive" },
  { name: "On Leave", count: 4, color: "bg-primary" },
];

const recentEmployees = [
  { name: "Alex Turner", role: "Frontend Developer", status: "active", joinDate: "Jan 10, 2024" },
  { name: "Jessica Lee", role: "HR Manager", status: "active", joinDate: "Jan 8, 2024" },
  { name: "Robert Kim", role: "Data Analyst", status: "pending", joinDate: "Jan 12, 2024" },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Welcome, {user?.displayName || user?.email?.split('@')[0] || "Admin"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of your organization
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button variant="hero" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value="54"
            trend={{ value: 8, isPositive: true }}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Present Today"
            value="42"
            subtitle="78% attendance"
            icon={Clock}
            variant="success"
          />
          <StatCard
            title="Pending Requests"
            value="7"
            subtitle="Leave & Increments"
            icon={Calendar}
            variant="warning"
          />
          <StatCard
            title="Monthly Payroll"
            value="₹186K"
            trend={{ value: 12, isPositive: true }}
            icon={IndianRupee}
            variant="accent"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="font-display font-semibold text-lg">
                  Pending Approvals
                </h3>
              </div>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                {pendingApprovals.length} pending
              </Badge>
            </div>
            <div className="divide-y">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={item.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{item.employee}</p>
                      <p className="text-sm text-muted-foreground">{item.request}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-2">
                      {item.submittedAt}
                    </span>
                    <Button size="sm" variant="ghost" className="text-success hover:bg-success/10">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Attendance */}
          <div className="rounded-xl border bg-card shadow-card">
            <div className="p-4 border-b">
              <h3 className="font-display font-semibold text-lg">
                Today's Attendance
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {todayAttendance.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(item.count / 54) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Employees */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-display font-semibold text-lg">
              Recently Added Employees
            </h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="divide-y">
            {recentEmployees.map((employee, index) => (
              <div
                key={index}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-accent/10 text-accent">
                      {employee.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{employee.joinDate}</span>
                  <Badge
                    variant="outline"
                    className={
                      employee.status === "active"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-warning/10 text-warning border-warning/20"
                    }
                  >
                    {employee.status === "active" ? "Active" : "Pending Approval"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
