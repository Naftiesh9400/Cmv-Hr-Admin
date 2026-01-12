import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const leaveRequests = [
  { id: 1, employee: "Sarah Johnson", type: "Casual Leave", from: "2024-01-20", to: "2024-01-21", days: 2, reason: "Family function", status: "Pending" },
  { id: 2, employee: "Michael Chen", type: "Sick Leave", from: "2024-01-15", to: "2024-01-15", days: 1, reason: "Fever", status: "Approved" },
  { id: 3, employee: "Emily Davis", type: "Work from Home", from: "2024-01-25", to: "2024-01-26", days: 2, reason: "Internet issues", status: "Pending" },
];

export default function AdminLeave() {
  const handleAction = (id: number, action: 'approve' | 'reject') => {
    toast.success(`Leave request ${action}d successfully`);
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Leave Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage employee leave applications
          </p>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {request.employee.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{request.employee}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{request.from} to {request.to}</p>
                      <p className="text-muted-foreground text-xs">{request.days} days</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={request.reason}>{request.reason}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={request.status === "Approved" ? "bg-success/10 text-success border-success/20" : request.status === "Pending" ? "bg-warning/10 text-warning border-warning/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "Pending" && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="text-success hover:bg-success/10 hover:text-success" onClick={() => handleAction(request.id, 'approve')}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleAction(request.id, 'reject')}>
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