import { Clock, Calendar, DollarSign, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "attendance" | "leave" | "salary" | "document" | "increment";
  title: string;
  description: string;
  time: string;
  status?: "approved" | "rejected" | "pending";
}

const activities: Activity[] = [
  {
    id: "1",
    type: "attendance",
    title: "Clocked in",
    description: "Started work at 9:00 AM",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "leave",
    title: "Leave Request Approved",
    description: "Casual leave for Dec 25-26",
    time: "Yesterday",
    status: "approved",
  },
  {
    id: "3",
    type: "salary",
    title: "Salary Credited",
    description: "December salary deposited",
    time: "2 days ago",
  },
  {
    id: "4",
    type: "increment",
    title: "Increment Request",
    description: "Under review by HR",
    time: "1 week ago",
    status: "pending",
  },
  {
    id: "5",
    type: "document",
    title: "New Document",
    description: "Offer letter available",
    time: "2 weeks ago",
  },
];

const typeIcons = {
  attendance: Clock,
  leave: Calendar,
  salary: DollarSign,
  document: FileText,
  increment: DollarSign,
};

const typeColors = {
  attendance: "bg-primary/10 text-primary",
  leave: "bg-accent/10 text-accent",
  salary: "bg-success/10 text-success",
  document: "bg-cloudhr-purple/10 text-cloudhr-purple",
  increment: "bg-warning/10 text-warning",
};

const statusIcons = {
  approved: CheckCircle,
  rejected: XCircle,
  pending: AlertCircle,
};

const statusColors = {
  approved: "text-success",
  rejected: "text-destructive",
  pending: "text-warning",
};

export function RecentActivity() {
  return (
    <div className="rounded-xl p-6 shadow-card border bg-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            Recent Activity
          </h3>
          <p className="text-sm text-muted-foreground">Your latest updates</p>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = typeIcons[activity.type];
          const StatusIcon = activity.status ? statusIcons[activity.status] : null;

          return (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50",
                index === 0 && "bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  typeColors[activity.type]
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {activity.title}
                  </p>
                  {StatusIcon && (
                    <StatusIcon
                      className={cn("w-4 h-4", statusColors[activity.status!])}
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
