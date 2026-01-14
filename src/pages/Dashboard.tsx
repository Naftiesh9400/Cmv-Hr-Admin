import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
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
import { getFirestore, doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [birthdays, setBirthdays] = useState<any[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else if (hour >= 17 && hour < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  useEffect(() => {
    const fetchQuote = async () => {
      const today = new Date().toDateString();
      const storedQuoteData = localStorage.getItem("dailyQuote");

      if (storedQuoteData) {
        const { date, quote, author } = JSON.parse(storedQuoteData);
        if (date === today) {
          setQuote(quote);
          setQuoteAuthor(author);
          return;
        }
      }

      try {
        const response = await fetch("https://api.quotable.io/random?tags=motivational");
        const data = await response.json();
        const newQuote = `"${data.content}"`;
        const newAuthor = `- ${data.author}`;
        setQuote(newQuote);
        setQuoteAuthor(newAuthor);
        localStorage.setItem("dailyQuote", JSON.stringify({
          date: today,
          quote: newQuote,
          author: newAuthor
        }));
      } catch (error) {
        const fallbackQuotes = [
          { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
          { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
          { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
          { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
          { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
        ];
        const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        setQuote(`"${randomFallback.text}"`);
        setQuoteAuthor(`- ${randomFallback.author}`);
        localStorage.setItem("dailyQuote", JSON.stringify({
          date: today,
          quote: `"${randomFallback.text}"`,
          author: `- ${randomFallback.author}`
        }));
      }
    };
    fetchQuote();
  }, []);

  useEffect(() => {
    const fetchBirthdays = async () => {
      const today = new Date();
      const month = today.getMonth();
      const date = today.getDate();
      
      try {
        const snap = await getDocs(collection(db, "users"));
        const bdays = snap.docs
          .map(doc => doc.data())
          .filter((u: any) => {
            if (!u.dob) return false;
            const d = new Date(u.dob);
            return d.getMonth() === month && d.getDate() === date;
          });
        setBirthdays(bdays);
      } catch (error) {
        console.error("Error fetching birthdays:", error);
      }
    };
    fetchBirthdays();
  }, [db]);

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
        {birthdays.length > 0 && (
          <div className="w-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 border border-pink-500/20 p-1 rounded-xl overflow-hidden relative">
             <div className="flex items-center gap-8 animate-marquee whitespace-nowrap py-2">
               {birthdays.map((u, i) => (
                 <div key={i} className="flex items-center gap-3 px-4">
                    <Avatar className="w-8 h-8 border-2 border-pink-200">
                      <AvatarImage src={u.photoURL} />
                      <AvatarFallback>{u.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-pink-700 dark:text-pink-300">
                      Happy Birthday, {u.displayName}! 🎂
                    </span>
                 </div>
               ))}
             </div>
             <style>{`
               @keyframes marquee {
                 0% { transform: translateX(100%); }
                 100% { transform: translateX(-100%); }
               }
               .animate-marquee {
                 animation: marquee 20s linear infinite;
               }
               .animate-marquee:hover {
                 animation-play-state: paused;
               }
             `}</style>
          </div>
        )}
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
