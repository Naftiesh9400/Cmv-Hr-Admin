import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, CheckCircle, XCircle, Clock, Home } from "lucide-react";
import { toast } from "sonner";

const leaveTypes = [
  { value: "casual", label: "Casual Leave", balance: 8, color: "bg-primary" },
  { value: "sick", label: "Sick Leave", balance: 4, color: "bg-warning" },
  { value: "paid", label: "Paid Leave", balance: 12, color: "bg-success" },
  { value: "wfh", label: "Work from Home", balance: 10, color: "bg-accent" },
];

const leaveRequests = [
  {
    id: 1,
    type: "Casual Leave",
    from: "2024-01-20",
    to: "2024-01-21",
    days: 2,
    reason: "Family function",
    status: "approved",
    appliedOn: "2024-01-10",
  },
  {
    id: 2,
    type: "Sick Leave",
    from: "2024-01-15",
    to: "2024-01-15",
    days: 1,
    reason: "Not feeling well",
    status: "approved",
    appliedOn: "2024-01-14",
  },
  {
    id: 3,
    type: "Work from Home",
    from: "2024-01-25",
    to: "2024-01-26",
    days: 2,
    reason: "Internet issue at office area",
    status: "pending",
    appliedOn: "2024-01-12",
  },
  {
    id: 4,
    type: "Paid Leave",
    from: "2024-02-01",
    to: "2024-02-05",
    days: 5,
    reason: "Vacation",
    status: "rejected",
    appliedOn: "2024-01-08",
    rejectionNote: "Team deadline conflicts",
  },
];

const statusIcons = {
  approved: CheckCircle,
  rejected: XCircle,
  pending: Clock,
};

const statusStyles = {
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

export default function Leave() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Leave request submitted!", {
      description: "Your request will be reviewed by HR",
    });
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Leave Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Apply for leave and track your requests
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-display">Apply for Leave</DialogTitle>
                <DialogDescription>
                  Submit your leave request for approval
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleApplyLeave} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} ({type.balance} days left)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input type="date" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Explain your reason for leave..."
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {leaveTypes.map((type) => (
            <div
              key={type.value}
              className="p-4 rounded-xl bg-card border shadow-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                <span className="text-sm font-medium text-muted-foreground">
                  {type.label}
                </span>
              </div>
              <p className="text-3xl font-bold font-display text-foreground">
                {type.balance}
              </p>
              <p className="text-sm text-muted-foreground">days remaining</p>
            </div>
          ))}
        </div>

        {/* Leave Requests */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="p-4 border-b">
            <h2 className="font-display font-semibold text-lg">My Leave Requests</h2>
          </div>
          <div className="divide-y">
            {leaveRequests.map((request) => {
              const StatusIcon = statusIcons[request.status as keyof typeof statusIcons];
              return (
                <div
                  key={request.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        {request.type === "Work from Home" ? (
                          <Home className="w-5 h-5 text-accent" />
                        ) : (
                          <Calendar className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{request.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.from} to {request.to} • {request.days} day(s)
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.reason}
                        </p>
                        {request.rejectionNote && (
                          <p className="text-sm text-destructive mt-1">
                            Note: {request.rejectionNote}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <Badge
                        variant="outline"
                        className={`gap-1 ${statusStyles[request.status as keyof typeof statusStyles]}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Applied: {request.appliedOn}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
