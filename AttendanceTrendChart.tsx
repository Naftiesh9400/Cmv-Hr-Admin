import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { subDays, format, eachDayOfInterval, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AttendanceTrendChart() {
  const db = getFirestore();
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const end = new Date();
      const start = subDays(end, 29);
      const dateRange = eachDayOfInterval({ start, end });

      const dateStrings = dateRange.map(d => format(d, "yyyy-MM-dd"));

      // Fetch all relevant data in parallel
      const usersSnap = await getDocs(collection(db, "users"));
      const totalEmployees = usersSnap.size;

      const attendanceQuery = query(collection(db, "attendance"), where("date", ">=", format(start, "yyyy-MM-dd")));
      const attendanceSnap = await getDocs(attendanceQuery);
      const attendanceRecords = attendanceSnap.docs.map(d => d.data());

      const leavesQuery = query(collection(db, "leaves"), where("status", "in", ["Approved", "approved"]), where("from", "<=", format(end, "yyyy-MM-dd")));
      const leavesSnap = await getDocs(leavesQuery);
      const leaveRecords = leavesSnap.docs.map(d => d.data()).filter(l => new Date(l.to) >= start);

      const data = dateStrings.map(dateStr => {
        const day = startOfDay(new Date(dateStr));

        const present = attendanceRecords.filter(r => r.date === dateStr && (r.status === 'present' || r.status === 'late')).length;
        
        const onLeave = leaveRecords.filter(l => {
          const leaveStart = startOfDay(new Date(l.from));
          const leaveEnd = startOfDay(new Date(l.to));
          return day >= leaveStart && day <= leaveEnd;
        }).length;

        const absent = Math.max(0, totalEmployees - present - onLeave);

        return {
          name: format(day, "MMM d"),
          Present: present,
          "On Leave": onLeave,
          Absent: absent,
        };
      });

      setChartData(data);
      setLoading(false);
    };

    fetchData();
  }, [db]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trends</CardTitle>
        <CardDescription>Last 30 days overview</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart data...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
              <Legend />
              <Area type="monotone" dataKey="Present" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} />
              <Area type="monotone" dataKey="On Leave" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              <Area type="monotone" dataKey="Absent" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}