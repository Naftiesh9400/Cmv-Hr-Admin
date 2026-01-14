import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
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
  const { user } = useAuth();
  const db = getFirestore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    from: "",
    to: "",
    reason: ""
  });
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState([
    { value: "casual", label: "Casual Leave", balance: 0, color: "bg-primary" },
    { value: "sick", label: "Sick Leave", balance: 0, color: "bg-warning" },
    { value: "paid", label: "Paid Leave", balance: 0, color: "bg-success" },
    { value: "wfh", label: "Work from Home", balance: 0, color: "bg-accent" },
  ]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const balances = data.leaveBalance || {};
        setLeaveBalances([
          { value: "casual", label: "Casual Leave", balance: balances.casual || 0, color: "bg-primary" },
          { value: "sick", label: "Sick Leave", balance: balances.sick || 0, color: "bg-warning" },
          { value: "paid", label: "Paid Leave", balance: balances.paid || 0, color: "bg-success" },
          { value: "wfh", label: "Work from Home", balance: balances.wfh || 0, color: "bg-accent" },
        ]);
      }
    });
    return () => unsub();
  }, [user, db]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "leaves"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLeaveRequests(requests);
    });

    return () => unsubscribe();
  }, [user, db]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, "leaves"), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0],
        ...formData,
        status: "pending",
        appliedOn: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });

      // Check settings for email notifications
      const settingsSnap = await getDoc(doc(db, "settings", "general"));
      const shouldSendEmail = settingsSnap.exists() && settingsSnap.data().emailNotifications;

      // Notify Admin
      await addDoc(collection(db, "notifications"), {
        recipientId: "admin",
        title: "New Leave Request",
        message: `${user.displayName || "Employee"} applied for ${formData.type}`,
        type: "leave",
        read: false,
        createdAt: serverTimestamp(),
        link: "/admin/leave",
        sendEmail: shouldSendEmail
      });

      toast.success("Leave request submitted!", {
        description: "Your request will be reviewed by HR",
      });
    } catch (error) {
      toast.error("Failed to submit leave request");
    }
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
                  <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveBalances.map((type) => (
                        <SelectItem key={type.value} value={type.label}>
                          {type.label} ({type.balance} days left)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input type="date" required onChange={(e) => setFormData({...formData, from: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input type="date" required onChange={(e) => setFormData({...formData, to: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Explain your reason for leave..."
                    rows={3}
                    required
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
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
          {leaveBalances.map((type) => (
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
              const StatusIcon = statusIcons[request.status as keyof typeof statusIcons] || Clock;
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
                          {request.from} to {request.to} • {
                            Math.ceil((new Date(request.to).getTime() - new Date(request.from).getTime()) / (1000 * 60 * 60 * 24)) + 1
                          } day(s)
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
                        className={`gap-1 ${statusStyles[request.status as keyof typeof statusStyles] || statusStyles.pending}`}
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
