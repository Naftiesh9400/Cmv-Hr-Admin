import { useEffect, useState } from "react";
import { Clock, Calendar, DollarSign, FileText, CheckCircle, XCircle, AlertCircle, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "attendance" | "leave" | "salary" | "document" | "increment";
  title: string;
  description: string;
  time: string;
  status?: "approved" | "rejected" | "pending";
  timestamp?: Date;
}

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
  const { user } = useAuth();
  const db = getFirestore();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) return;

    const attendanceQuery = query(
      collection(db, "attendance"),
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
      limit(5)
    );

    const leavesQuery = query(
      collection(db, "leaves"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const incrementsQuery = query(
      collection(db, "increments"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    let attendanceActivities: Activity[] = [];
    let leaveActivities: Activity[] = [];
    let incrementActivities: Activity[] = [];

    const updateActivities = () => {
      const allActivities = [...attendanceActivities, ...leaveActivities, ...incrementActivities];
      allActivities.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
      setActivities(allActivities.slice(0, 5));
    };

    const unsubAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      attendanceActivities = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.clockIn) {
          attendanceActivities.push({
            id: `${doc.id}_in`,
            type: "attendance",
            title: "Clocked In",
            description: `Started work at ${data.clockIn.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            time: formatDistanceToNow(data.clockIn.toDate(), { addSuffix: true }),
            timestamp: data.clockIn.toDate(),
          });
        }
        if (data.clockOut) {
          attendanceActivities.push({
            id: `${doc.id}_out`,
            type: "attendance",
            title: "Clocked Out",
            description: `Finished work at ${data.clockOut.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            time: formatDistanceToNow(data.clockOut.toDate(), { addSuffix: true }),
            timestamp: data.clockOut.toDate(),
          });
        }
      });
      updateActivities();
    });

    const unsubLeaves = onSnapshot(leavesQuery, (snapshot) => {
      leaveActivities = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        leaveActivities.push({
          id: doc.id,
          type: "leave",
          title: "Leave Request",
          description: `${data.type} (${data.from} to ${data.to})`,
          time: data.createdAt ? formatDistanceToNow(data.createdAt.toDate(), { addSuffix: true }) : "Just now",
          timestamp: data.createdAt ? data.createdAt.toDate() : new Date(),
          status: (data.status?.toLowerCase() as any) || "pending",
        });
      });
      updateActivities();
    });

    const unsubIncrements = onSnapshot(incrementsQuery, (snapshot) => {
      incrementActivities = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        incrementActivities.push({
          id: doc.id,
          type: "increment",
          title: "Increment Request",
          description: `Request for ₹${data.expectedAmount} - ${data.reason}`,
          time: data.createdAt ? formatDistanceToNow(data.createdAt.toDate(), { addSuffix: true }) : "Just now",
          timestamp: data.createdAt ? data.createdAt.toDate() : new Date(),
          status: (data.status?.toLowerCase() as any) || "pending",
        });
      });
      updateActivities();
    });

    return () => {
      unsubAttendance();
      unsubLeaves();
      unsubIncrements();
    };
  }, [user, db]);

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
        {activities.length > 0 ? activities.map((activity, index) => {
          let Icon = typeIcons[activity.type];
          if (activity.title === "Clocked In") Icon = LogIn;
          if (activity.title === "Clocked Out") Icon = LogOut;
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
        }) : (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
}
