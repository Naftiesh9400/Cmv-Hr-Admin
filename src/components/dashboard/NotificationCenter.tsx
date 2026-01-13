import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  writeBatch, 
  updateDoc, 
  arrayUnion 
} from "firebase/firestore";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface NotificationCenterProps {
  isAdmin?: boolean;
}

export function NotificationCenter({ isAdmin = false }: NotificationCenterProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [rawNotifications, setRawNotifications] = useState<any[]>([]);
  const [readBroadcastIds, setReadBroadcastIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
      const userData = userDoc.data();
      setReadBroadcastIds(userData?.readBroadcasts || []);
    });
    return () => unsubscribeUser();
  }, [user, db]);

  useEffect(() => {
    if (!user) return;
    const recipientIds = isAdmin ? ["admin", "all"] : [user.uid, "all"];
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "in", recipientIds),
      orderBy("createdAt", "desc")
    );
    const unsubscribeNotifications = onSnapshot(q, (snapshot) => {
      setRawNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribeNotifications();
  }, [user, isAdmin, db]);

  useEffect(() => {
    const processedNotifs = rawNotifications.map(n => {
      const isBroadcast = n.recipientId === 'all';
      const isRead = isBroadcast ? readBroadcastIds.includes(n.id) : n.read;
      return { ...n, read: isRead };
    });
    setNotifications(processedNotifs);
    setUnreadCount(processedNotifs.filter(n => !n.read).length);
  }, [rawNotifications, readBroadcastIds]);

  const markAllAsRead = async () => {
    if (unreadCount === 0 || !user) return;

    const personalNotifsToUpdate: string[] = [];
    const broadcastNotifsToUpdate: string[] = [];

    notifications.forEach(n => {
      if (!n.read) {
        if (n.recipientId === 'all') {
          broadcastNotifsToUpdate.push(n.id);
        } else {
          personalNotifsToUpdate.push(n.id);
        }
      }
    });

    try {
      if (personalNotifsToUpdate.length > 0) {
        const batch = writeBatch(db);
        personalNotifsToUpdate.forEach(id => {
          const ref = doc(db, "notifications", id);
          batch.update(ref, { read: true });
        });
        await batch.commit();
      }

      if (broadcastNotifsToUpdate.length > 0) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          readBroadcasts: arrayUnion(...broadcastNotifsToUpdate)
        });
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Could not mark notifications as read.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span 
              className="text-xs font-normal text-muted-foreground cursor-pointer hover:text-primary"
              onClick={markAllAsRead}
            >
              Mark all as read
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer" onClick={() => n.link && navigate(n.link)}>
              <div className="flex items-center justify-between w-full">
                <span className={`font-medium ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {n.title}
                </span>
                <span className="text-xs text-muted-foreground">{n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'Just now'}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {n.message}
              </p>
            </DropdownMenuItem>
          )) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}