import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Users,
  Clock,
  Calendar,
  IndianRupee,
  TrendingUp,
  UserPlus,
  Download,
  Gift,
  LogOut,
} from "lucide-react";
import { getFirestore, collection, query, where, onSnapshot, orderBy, limit, doc, setDoc, serverTimestamp, addDoc, getDocs, writeBatch } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AttendanceTrendChart } from "./AttendanceTrendChart";

export default function AdminDashboard() {
  const { user } = useAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingRequests: 0,
    monthlyPayroll: 0
  });

  const [greeting, setGreeting] = useState("Good morning");
  const [quote, setQuote] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "employee",
    dob: "",
    joinDate: "",
  });

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([
    { name: "Present", count: 0, color: "bg-success" },
    { name: "Late", count: 0, color: "bg-warning" },
    { name: "Absent", count: 0, color: "bg-destructive" },
    { name: "On Leave", count: 0, color: "bg-primary" },
  ]);
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [pendingIncrements, setPendingIncrements] = useState<any[]>([]);
  const [pendingResignations, setPendingResignations] = useState<any[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else if (hour >= 17 && hour < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch("https://api.quotable.io/random");
        const data = await response.json();
        setQuote(`"${data.content}"`);
        setQuoteAuthor(`- ${data.author}`);
      } catch (error) {
        setQuote("\"Leadership is not about being in charge. It is about taking care of those in your charge.\"");
        setQuoteAuthor("- Simon Sinek");
      }
    };
    fetchQuote();
  }, []);

  useEffect(() => {
    // 1. Fetch Users Data (Total Employees, Payroll, Recent Employees)
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const total = users.length;
      const payroll = users.reduce((sum, u: any) => sum + (Number(u.currentSalary) || 0), 0);
      
      setStats(prev => ({ ...prev, totalEmployees: total, monthlyPayroll: payroll }));
      setRecentEmployees(users.slice(0, 5));
    });

    // 2. Fetch Today's Attendance
    const today = new Date().toISOString().split('T')[0];
    const attendanceQuery = query(collection(db, "attendance"), where("date", "==", today));
    const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      const records = snapshot.docs.map(doc => doc.data());
      const present = records.filter((r: any) => r.status === 'present').length;
      const late = records.filter((r: any) => r.status === 'late').length;
      
      setStats(prev => ({ ...prev, presentToday: present + late }));
      
      setTodayAttendance(prev => prev.map(item => {
        if (item.name === "Present") return { ...item, count: present };
        if (item.name === "Late") return { ...item, count: late };
        return item;
      }));
    });

    // 3. Fetch Leaves (Pending & On Leave Today)
    const leavesQuery = query(collection(db, "leaves"));
    const unsubscribeLeaves = onSnapshot(leavesQuery, (snapshot) => {
      const leaves = snapshot.docs.map(doc => ({ id: doc.id, type: 'leave', ...doc.data() }));
      
      // Pending Leaves
      setPendingLeaves(leaves.filter((l: any) => l.status === 'pending'));
      
      // On Leave Today
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      const onLeaveCount = leaves.filter((l: any) => {
        if (l.status !== 'Approved' && l.status !== 'approved') return false;
        const start = new Date(l.from);
        const end = new Date(l.to);
        return todayDate >= start && todayDate <= end;
      }).length;

      setTodayAttendance(prev => prev.map(item => {
        if (item.name === "On Leave") return { ...item, count: onLeaveCount };
        return item;
      }));
    });

    // 4. Fetch Increments (Pending)
    const incrementsQuery = query(collection(db, "increments"), where("status", "==", "pending"));
    const unsubscribeIncrements = onSnapshot(incrementsQuery, (snapshot) => {
      setPendingIncrements(snapshot.docs.map(doc => ({ id: doc.id, type: 'increment', ...doc.data() })));
    });

    // 5. Fetch Resignations (Pending)
    const resignationsQuery = query(collection(db, "resignations"), where("status", "==", "pending"));
    const unsubscribeResignations = onSnapshot(resignationsQuery, (snapshot) => {
      setPendingResignations(snapshot.docs.map(doc => ({ id: doc.id, type: 'resignation', ...doc.data() })));
    });

    return () => {
      unsubscribeUsers();
      unsubscribeAttendance();
      unsubscribeLeaves();
      unsubscribeIncrements();
      unsubscribeResignations();
    };
  }, [db]);

  // Combine pending requests and calculate absent count
  useEffect(() => {
    const allPending = [...pendingLeaves, ...pendingIncrements, ...pendingResignations].sort((a, b) => {
      const dateA = a.createdAt ? a.createdAt.toDate() : new Date();
      const dateB = b.createdAt ? b.createdAt.toDate() : new Date();
      return dateB.getTime() - dateA.getTime();
    });
    setPendingApprovals(allPending.slice(0, 5));
    setStats(prev => ({ ...prev, pendingRequests: allPending.length }));

    // Calculate Absent
    const present = todayAttendance.find(i => i.name === "Present")?.count || 0;
    const late = todayAttendance.find(i => i.name === "Late")?.count || 0;
    const onLeave = todayAttendance.find(i => i.name === "On Leave")?.count || 0;
    const absent = Math.max(0, stats.totalEmployees - (present + late + onLeave));
    
    setTodayAttendance(prev => prev.map(item => {
      if (item.name === "Absent") return { ...item, count: absent };
      return item;
    }));
  }, [pendingLeaves, pendingIncrements, pendingResignations, stats.totalEmployees, todayAttendance[0].count, todayAttendance[1].count, todayAttendance[3].count]);

  const handleExport = () => {
    if (recentEmployees.length === 0) {
      toast.warning("No employee data to export.");
      return;
    }

    const headers = ["ID", "Name", "Email", "Role", "Salary", "Last Login"];
    const csvRows = [headers.join(",")];

    for (const emp of recentEmployees) {
      const values = [
        emp.id,
        emp.displayName || emp.email,
        emp.email,
        emp.role || "Employee",
        emp.currentSalary || 0,
        emp.lastLogin ? format(emp.lastLogin.toDate(), "yyyy-MM-dd") : "N/A",
      ];
      csvRows.push(values.map(v => `"${v}"`).join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `employee-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Employee report exported successfully.");
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      // This is a simplified version. In a real app, you'd use Firebase Admin SDK on a server
      // to create users without them having to log in. This client-side method is for demonstration.
      const userCredential = await createUserWithEmailAndPassword(auth, newEmployee.email, newEmployee.password);
      const newUser = userCredential.user;

      await setDoc(doc(db, "users", newUser.uid), {
        displayName: newEmployee.displayName,
        email: newEmployee.email,
        role: newEmployee.role,
        dob: newEmployee.dob,
        joinDate: newEmployee.joinDate,
        createdAt: serverTimestamp(),
      });

      toast.success("Employee added successfully!");
      setIsAddEmployeeOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add employee.");
    }
  };

  const sendWishes = async () => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    let wishesSent = 0;
    
    toast.info("Checking for birthdays and anniversaries...");
    
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const batch = writeBatch(db);
      let hasUpdates = false;

      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        
        // Check Birthday
        if (userData.dob) {
          const dob = new Date(userData.dob);
          if (dob.getMonth() === todayMonth && dob.getDate() === todayDate) {
            const newNotifRef = doc(collection(db, "notifications"));
            batch.set(newNotifRef, {
              recipientId: "all",
              title: "Happy Birthday! 🎂",
              message: `Happy Birthday to ${userData.displayName || "Employee"}!`,
              read: false,
              createdAt: serverTimestamp(),
              type: "system",
              sendEmail: true // Flag for Cloud Function to send email
            });
            wishesSent++;
            hasUpdates = true;
          }
        }

        // Check Anniversary
        if (userData.joinDate) {
          const joinDate = new Date(userData.joinDate);
          if (joinDate.getMonth() === todayMonth && joinDate.getDate() === todayDate && joinDate.getFullYear() < today.getFullYear()) {
            const years = today.getFullYear() - joinDate.getFullYear();
            const newNotifRef = doc(collection(db, "notifications"));
            batch.set(newNotifRef, {
              recipientId: "all",
              title: "Work Anniversary! 🎉",
              message: `Congratulations to ${userData.displayName || "Employee"} on completing ${years} years!`,
              read: false,
              createdAt: serverTimestamp(),
              type: "system",
              sendEmail: true // Flag for Cloud Function to send email
            });
            wishesSent++;
            hasUpdates = true;
          }
        }
      });

      if (hasUpdates) {
        await batch.commit();
        toast.success(`Sent ${wishesSent} automated wishes!`);
      } else {
        toast.info("No birthdays or anniversaries found for today.");
      }
    } catch (error) {
      console.error("Error sending wishes:", error);
      toast.error("Failed to send wishes.");
    }
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {greeting}, {user?.displayName || user?.email?.split('@')[0] || "Admin"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of your organization
            </p>
            <p className="text-sm text-muted-foreground mt-2 italic">
              {quote}
            </p>
            <p className="text-xs text-muted-foreground text-right font-medium">
              {quoteAuthor}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={sendWishes}>
              <Gift className="w-4 h-4" />
              Send Wishes
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Create a new user account and add them to the organization.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEmployee} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input id="displayName" placeholder="John Doe" required onChange={(e) => setNewEmployee({...newEmployee, displayName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" required onChange={(e) => setNewEmployee({...newEmployee, dob: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Joining Date</Label>
                    <Input id="joinDate" type="date" required onChange={(e) => setNewEmployee({...newEmployee, joinDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input id="email" type="email" placeholder="john.doe@company.com" required onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input id="password" type="password" required onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})} />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Employee</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            trend={{ value: 8, isPositive: true }}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            subtitle={`${stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}% attendance`}
            icon={Clock}
            variant="success"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            subtitle="Leave, Resignations & Increments"
            icon={Calendar}
            variant="warning"
          />
          <StatCard
            title="Resignations"
            value={pendingResignations.length}
            subtitle="Pending Approval"
            icon={LogOut}
            variant="destructive"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/admin/resignations")}
          />
          <StatCard
            title="Monthly Payroll"
            value={`₹${(stats.monthlyPayroll / 1000).toFixed(1)}K`}
            trend={{ value: 12, isPositive: true }}
            icon={IndianRupee}
            variant="accent"
          />
        </div>

        {/* Attendance Trend Chart */}
        <AttendanceTrendChart />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <PendingApprovals approvals={pendingApprovals} />

          {/* Today's Attendance */}
          <div className="rounded-xl border bg-card shadow-card">
            <div className="p-4 border-b">
              <h3 className="font-display font-semibold text-lg">
                Today's Attendance
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {todayAttendance.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${stats.totalEmployees > 0 ? (item.count / stats.totalEmployees) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Employees */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-display font-semibold text-lg">
              Recently Added Employees
            </h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="divide-y">
            {recentEmployees.map((employee) => (
              <div
                key={employee.id}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-accent/10 text-accent">
                      {employee.displayName?.substring(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{employee.displayName || employee.email}</p>
                    <p className="text-sm text-muted-foreground">{employee.role || "Employee"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{employee.lastLogin ? new Date(employee.lastLogin.seconds * 1000).toLocaleDateString() : "-"}</span>
                  <Badge
                    variant="outline"
                    className={
                      true // Assuming active for now
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-warning/10 text-warning border-warning/20"
                    }
                  >
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
