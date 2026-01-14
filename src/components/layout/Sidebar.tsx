import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  IndianRupee,
  FileText,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Shield,
  Bell,
  Network,
  Star,
} from "lucide-react";

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const employeeNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Clock, label: "Attendance", path: "/attendance" },
    { icon: Calendar, label: "Leave", path: "/leave" },
    { icon: IndianRupee, label: "Salary", path: "/salary" },
    { icon: TrendingUp, label: "Increment", path: "/increment" },
    { icon: FileText, label: "Documents", path: "/documents" },
    { icon: Users, label: "Directory", path: "/directory" },
    { icon: Network, label: "Org Chart", path: "/org-chart" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Star, label: "Performance", path: "/performance" },
    { icon: LogOut, label: "Resignation", path: "/resignation" },
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Employees", path: "/admin/employees" },
    { icon: Clock, label: "Attendance", path: "/admin/attendance" },
    { icon: Calendar, label: "Leave Requests", path: "/admin/leave" },
    { icon: IndianRupee, label: "Payroll", path: "/admin/payroll" },
    { icon: FileText, label: "Documents", path: "/admin/documents" },
    { icon: TrendingUp, label: "Increments", path: "/admin/increments" },
    { icon: Star, label: "Performance", path: "/admin/performance" },
    { icon: LogOut, label: "Resignations", path: "/admin/resignations" },
    { icon: Building2, label: "Organization", path: "/admin/organization" },
    { icon: Shield, label: "Roles & Access", path: "/admin/roles" },
    { icon: Bell, label: "Notifications", path: "/admin/notifications" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className={cn("transition-all duration-300", collapsed && "scale-75")}>
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
            </div>
          ) : (
            <Logo variant="light" />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive && "animate-pulse-ring"
                )}
              />
              {!collapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </Link>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
