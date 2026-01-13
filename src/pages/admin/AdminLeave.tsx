import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getFirestore, collection, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, onSnapshot, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminLeave() {
  const db = getFirestore();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = query(collection(db, "leaves"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeaveRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [db]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const request = leaveRequests.find(r => r.id === id);
    if (!request) return;

    try {
      await updateDoc(doc(db, "leaves", id), {
        status: action === 'approve' ? 'Approved' : 'Rejected'
      });

      // Notify Employee
      await addDoc(collection(db, "notifications"), {
        recipientId: request.userId,
        title: `Leave Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your leave request for ${request.type} has been ${action}d.`,
        type: "leave",
        read: false,
        createdAt: serverTimestamp(),
        link: "/leave"
      });

      toast.success(`Leave request ${action}d successfully`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredRequests = leaveRequests.filter(request =>
    request.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by employee name or leave type..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
              {filteredRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {request.userName?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{request.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{request.from} to {request.to}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={request.reason}>{request.reason}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={request.status === "Approved" ? "bg-success/10 text-success border-success/20" : request.status === "pending" ? "bg-warning/10 text-warning border-warning/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" && (
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