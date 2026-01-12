import { ReactNode, useState } from "react";
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

interface DashboardLayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
}

const notifications = [
  {
    id: 1,
    title: "Leave Approved",
    message: "Your casual leave for Jan 20 has been approved.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    title: "New Policy Document",
    message: "HR has uploaded a new travel policy.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: 3,
    title: "Salary Credited",
    message: "Salary for January 2024 has been processed.",
    time: "1 day ago",
    read: true,
  },
];

export function DashboardLayout({ children, isAdmin = false }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || "User";
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(2);
  const navigate = useNavigate();

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
                      onClick={(e) => {
                        e.preventDefault();
                        setUnreadCount(0);
                      }}
                    >
                      Mark all as read
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-medium ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {n.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                    </DropdownMenuItem>
                  ))}
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
