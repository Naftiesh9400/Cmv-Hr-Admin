import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { BirthdayWidget } from "@/components/dashboard/BirthdayWidget";
import { WorkAnniversaryWidget } from "@/components/dashboard/WorkAnniversaryWidget";
import { HolidaysWidget } from "@/components/dashboard/HolidaysWidget";
import { StatCard } from "@/components/dashboard/StatCard";
import { ClockWidget } from "@/components/dashboard/ClockWidget";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  Clock,
  Calendar,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const { user } = useAuth();
  const db = getFirestore();
  const displayName = user?.displayName || user?.email?.split('@')[0] || "User";
  const [todayHours, setTodayHours] = useState("0h 0m");
  const hoursWorked = parseInt(todayHours.split("h")[0]) || 0;
  const [stats, setStats] = useState({
    leaveBalance: { casual: 0, sick: 0 },
    currentSalary: 0,
    performance: { score: 0, trend: 0 }
  });
  const [greeting, setGreeting] = useState("Good morning");
  const [quote, setQuote] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");

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
        setQuote("\"The only way to do great work is to love what you do.\"");
        setQuoteAuthor("- Steve Jobs");
      }
    };
    fetchQuote();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats({
          leaveBalance: data.leaveBalance || { casual: 0, sick: 0 },
          currentSalary: data.currentSalary || 0,
          performance: data.performance || { score: 0, trend: 0 }
        });
      }
    });
    return () => unsubscribe();
  }, [user, db]);

  const totalLeave = (stats.leaveBalance.casual || 0) + (stats.leaveBalance.sick || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BirthdayWidget />
        <WorkAnniversaryWidget />
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {greeting}, {displayName}
            </h1>
            <p className="text-muted-foreground mt-2 italic">
              {quote}
            </p>
            <p className="text-sm text-muted-foreground text-right font-medium">
              {quoteAuthor}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">On Time Today</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Hours"
            value={todayHours}
            subtitle="In progress"
            icon={Clock}
            variant={hoursWorked >= 8 ? "success" : "primary"}
          />
          <StatCard
            title="Leave Balance"
            value={`${totalLeave} days`}
            subtitle={`Casual: ${stats.leaveBalance.casual}, Sick: ${stats.leaveBalance.sick}`}
            icon={Calendar}
            variant="accent"
          />
          <StatCard
            title="This Month"
            value={`₹${stats.currentSalary.toLocaleString()}`}
            subtitle="Net salary"
            icon={IndianRupee}
            variant="success"
          />
          <StatCard
            title="Performance"
            value={`${stats.performance.score}%`}
            trend={{ value: stats.performance.trend, isPositive: stats.performance.trend >= 0 }}
            icon={TrendingUp}
            variant="warning"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <AttendanceChart />
            <RecentActivity />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ClockWidget onWorkHoursChange={setTodayHours} />
            <QuickActions />
            <HolidaysWidget />
          </div>
        </div>

        {/* Alerts Section */}
        <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Pending Actions</p>
            <p className="text-sm text-muted-foreground">
              You have 2 pending leave requests and 1 document awaiting review.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
