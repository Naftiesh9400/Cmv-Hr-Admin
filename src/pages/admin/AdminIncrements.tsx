import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const incrementRequests = [
  { id: 1, name: "Mike Chen", role: "Senior Developer", current: 55000, requested: 65000, percentage: 18, reason: "Outstanding performance in Q4", status: "Pending", date: "Jan 15, 2024" },
  { id: 2, name: "Sarah Johnson", role: "Product Designer", current: 45000, requested: 50000, percentage: 11, reason: "Market correction", status: "Approved", date: "Jan 10, 2024" },
  { id: 3, name: "Lisa Anderson", role: "Frontend Dev", current: 40000, requested: 55000, percentage: 37.5, reason: "Completed 2 years", status: "Rejected", date: "Jan 05, 2024" },
];

export default function AdminIncrements() {
  const handleAction = (id: number, action: 'approve' | 'reject') => {
    toast.success(`Increment request ${action}d`);
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Increment Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage salary revision requests
          </p>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Employee</TableHead>
                <TableHead>Current Salary</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>% Hike</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incrementRequests.map((req) => (
                <TableRow key={req.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {req.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{req.name}</p>
                        <p className="text-xs text-muted-foreground">{req.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>₹{req.current.toLocaleString()}</TableCell>
                  <TableCell className="font-bold text-primary">₹{req.requested.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp className="w-3 h-3" />
                      {req.percentage}%
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={req.reason}>{req.reason}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        req.status === "Approved" ? "bg-success/10 text-success border-success/20" : 
                        req.status === "Rejected" ? "bg-destructive/10 text-destructive border-destructive/20" : 
                        "bg-warning/10 text-warning border-warning/20"
                      }
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "Pending" && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="text-success hover:bg-success/10" onClick={() => handleAction(req.id, 'approve')}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleAction(req.id, 'reject')}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
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