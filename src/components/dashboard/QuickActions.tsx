import { Link } from "react-router-dom";
import {
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  Download,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: Calendar,
    label: "Apply Leave",
    path: "/leave",
    color: "bg-accent/10 text-accent hover:bg-accent/20",
  },
  {
    icon: TrendingUp,
    label: "Request Increment",
    path: "/increment",
    color: "bg-warning/10 text-warning hover:bg-warning/20",
  },
  {
    icon: Clock,
    label: "View Attendance",
    path: "/attendance",
    color: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    icon: Download,
    label: "Download Payslip",
    path: "/salary",
    color: "bg-success/10 text-success hover:bg-success/20",
  },
  {
    icon: FileText,
    label: "My Documents",
    path: "/documents",
    color: "bg-cloudhr-purple/10 text-cloudhr-purple hover:bg-cloudhr-purple/20",
  },
  {
    icon: MessageSquare,
    label: "Daily Report",
    path: "/dashboard",
    color: "bg-cloudhr-orange/10 text-cloudhr-orange hover:bg-cloudhr-orange/20",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl p-6 shadow-card border bg-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.path}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:-translate-y-1",
              action.color
            )}
          >
            <action.icon className="w-6 h-6" />
            <span className="text-sm font-medium text-center">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
