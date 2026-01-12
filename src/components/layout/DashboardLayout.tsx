import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFirestore, collection, query, where, onSnapshot, orderBy, doc, writeBatch, updateDoc, arrayUnion } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

interface DashboardLayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
}

export function DashboardLayout({ children, isAdmin = false }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || "User";
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [rawNotifications, setRawNotifications] = useState<any[]>([]);
  const [readBroadcastIds, setReadBroadcastIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const db = getFirestore();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    const routes: Record<string, string> = {
      dashboard: "/dashboard",
      attendance: "/attendance",
      leave: "/leave",
      salary: "/salary",
      increment: "/increment",
      documents: "/documents",
      profile: "/profile",
      admin: "/admin",
    };

    const match = Object.keys(routes).find((r) => r.includes(query) || query.includes(r));
    if (match) {
      navigate(routes[match]);
      setSearchQuery("");
    } else {
      toast.error("No matching page found");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 bg-secondary border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
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

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-auto p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? "HR Admin" : "Employee"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
