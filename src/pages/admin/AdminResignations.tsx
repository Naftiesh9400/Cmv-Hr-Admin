import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export default function AdminResignations() {
  const db = getFirestore();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "resignations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [db]);

  const handleAction = async (id: string, status: 'approved' | 'rejected', userId: string) => {
    if (!confirm(`Are you sure you want to ${status} this request?`)) return;

    try {
      await updateDoc(doc(db, "resignations", id), { status });
      
      // Notify user
      await addDoc(collection(db, "notifications"), {
        recipientId: userId,
        title: `Resignation ${status === 'approved' ? 'Accepted' : 'Rejected'}`,
        message: `Your resignation request has been ${status}.`,
        read: false,
        createdAt: serverTimestamp(),
        type: "system"
      });

      toast.success(`Request ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Resignations</h1>
          <p className="text-muted-foreground">Manage employee resignation requests</p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Last Working Day</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{req.userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{req.userName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{req.lastWorkingDay}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={req.reason}>{req.reason}</TableCell>
                  <TableCell>
                    <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="text-success" onClick={() => handleAction(req.id, 'approved', req.userId)}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction(req.id, 'rejected', req.userId)}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No resignation requests</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}