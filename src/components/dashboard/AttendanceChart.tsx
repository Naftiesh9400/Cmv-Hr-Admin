import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns";

export function AttendanceChart() {
  const { user } = useAuth();
  const db = getFirestore();
  const [data, setData] = useState<{ day: string; hours: number }[]>([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const now = new Date();
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });
      
      let weeklyTotal = 0;

      const promises = days.map(async (day) => {
        const dateString = format(day, "yyyy-MM-dd");
        const docId = `${user.uid}_${dateString}`;
        const docRef = doc(db, "attendance", docId);
        
        let hours = 0;
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const d = docSnap.data();
            if (d.clockIn) {
              const clockIn = d.clockIn.toDate();
              const clockOut = d.clockOut ? d.clockOut.toDate() : (isSameDay(day, now) ? new Date() : null);
              
              if (clockOut) {
                const diff = clockOut.getTime() - clockIn.getTime();
                hours = diff / (1000 * 60 * 60);
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
        return {
          day: format(day, "EEE"),
          hours: Number(hours.toFixed(1)),
        };
      });

      const results = await Promise.all(promises);
      
      const finalData = results.map(r => {
        weeklyTotal += r.hours;
        return r;
      });

      setData(finalData);
      setTotalHours(weeklyTotal);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user, db]);

  return (
    <div className="rounded-xl p-6 shadow-card border bg-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            Weekly Work Hours
          </h3>
          <p className="text-sm text-muted-foreground">
            Your attendance this week
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-display text-foreground">{totalHours.toFixed(1)}h</p>
          <p className={`text-sm ${totalHours >= 40 ? "text-success" : "text-muted-foreground"}`}>{totalHours >= 40 ? "+" : ""}{(totalHours - 40).toFixed(1)}h vs target</p>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.length > 0 ? data : [{ day: "Mon", hours: 0 }]}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, 12]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="hsl(217 91% 60%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHours)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
