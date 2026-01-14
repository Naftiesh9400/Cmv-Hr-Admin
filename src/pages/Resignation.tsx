import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export default function Resignation() {
  const { user } = useAuth();
  const db = getFirestore();
  const [reason, setReason] = useState("");
  const [lastDay, setLastDay] = useState("");
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "resignations"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, db]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, "resignations"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        reason,
        lastWorkingDay: lastDay,
        status: "pending",
        createdAt: serverTimestamp()
      });
      toast.success("Resignation request submitted");
      setReason("");
      setLastDay("");
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  const handleWithdraw = async (id: string) => {
    if (confirm("Are you sure you want to withdraw this resignation request?")) {
      try {
        await deleteDoc(doc(db, "resignations", id));
        toast.success("Request withdrawn");
      } catch (error) {
        toast.error("Failed to withdraw request");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Resignation</h1>
          <p className="text-muted-foreground">Submit and track resignation requests</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit Resignation</CardTitle>
              <CardDescription>Please provide details for your resignation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Last Working Day</Label>
                  <Input type="date" required value={lastDay} onChange={e => setLastDay(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea required value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for leaving..." />
                </div>
                <Button type="submit">Submit Request</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Last Day: {req.lastWorkingDay}</p>
                        <p className="text-sm text-muted-foreground">{req.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {req.status}
                        </Badge>
                        {req.status === 'pending' && (
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleWithdraw(req.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Submitted: {req.createdAt?.toDate().toLocaleDateString()}</p>
                  </div>
                ))}
                {requests.length === 0 && <p className="text-muted-foreground text-sm">No requests found.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}