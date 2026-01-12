import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Bell } from "lucide-react";

export default function AdminNotifications() {
  const db = getFirestore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newNotif, setNewNotif] = useState({ title: "", message: "" });

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [db]);

  const sendNotification = async () => {
    if (!newNotif.title || !newNotif.message) return;
    try {
      // Sending to 'all' for simplicity in this example, or handled by client logic
      await addDoc(collection(db, "notifications"), {
        recipientId: "all", // Special ID for broadcast
        title: newNotif.title,
        message: newNotif.message,
        read: false,
        createdAt: serverTimestamp(),
        type: "system"
      });
      setNewNotif({ title: "", message: "" });
      toast.success("Notification sent");
    } catch (error) {
      toast.error("Failed to send");
    }
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Broadcast messages to employees</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Title" value={newNotif.title} onChange={e => setNewNotif({...newNotif, title: e.target.value})} />
              <Textarea placeholder="Message" value={newNotif.message} onChange={e => setNewNotif({...newNotif, message: e.target.value})} />
              <Button onClick={sendNotification} className="w-full">Send Broadcast</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="flex gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full h-fit"><Bell className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="font-medium">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                        {n.recipientId === 'all' && <span className="ml-2 text-primary">(Broadcast)</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}