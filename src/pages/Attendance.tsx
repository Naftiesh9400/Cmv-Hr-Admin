import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Clock,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const statusStyles = {
  present: "bg-success/10 text-success border-success/20",
  late: "bg-warning/10 text-warning border-warning/20",
  absent: "bg-destructive/10 text-destructive border-destructive/20",
  halfday: "bg-primary/10 text-primary border-primary/20",
  weekend: "bg-muted text-muted-foreground border-muted",
};

const statusLabels = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  halfday: "Half Day",
  weekend: "Weekend",
};

export default function Attendance() {
  const { user } = useAuth();
  const db = getFirestore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "attendance"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => {
          const d = doc.data();
          const dateObj = new Date(d.date);
          const clockIn = d.clockIn ? d.clockIn.toDate() : null;
          const clockOut = d.clockOut ? d.clockOut.toDate() : null;
          
          let workHours = "-";
          if (clockIn && clockOut) {
            const diff = clockOut.getTime() - clockIn.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            workHours = `${hours}h ${minutes}m`;
          }

          return {
            date: d.date,
            userName: user.displayName || d.userName || "Employee",
            day: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
            clockIn: clockIn ? clockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-",
            clockOut: clockOut ? clockOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-",
            workHours,
            status: d.status || "absent"
          };
        });
        setAttendanceData(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };
    fetchAttendance();
  }, [user, db]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "leaves"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeaves(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user, db]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "holidays"), (snapshot) => {
      setHolidays(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [db]);

  const filteredData = useMemo(() => {
    let data = attendanceData;
    
    if (dateRange?.from) {
      data = data.filter(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      
      const from = new Date(dateRange.from!);
      from.setHours(0, 0, 0, 0);
      
      const to = dateRange.to ? new Date(dateRange.to) : new Date(from);
      to.setHours(23, 59, 59, 999);
      
      return recordDate >= from && recordDate <= to;
      });
    }

    if (statusFilter !== "all") {
      data = data.filter(record => record.status === statusFilter);
    }

    return data;
  }, [attendanceData, dateRange, statusFilter]);

  const chartData = useMemo(() => {
    // Create a copy and reverse to show chronological order (oldest to newest)
    return [...filteredData].reverse().map(record => {
      let hours = 0;
      if (record.workHours !== "-") {
        const parts = record.workHours.split("h ");
        if (parts.length === 2) {
          hours = parseInt(parts[0]) + parseInt(parts[1].replace("m", "")) / 60;
        }
      }
      return {
        date: format(new Date(record.date), "MMM dd"),
        hours: Number(hours.toFixed(1)),
        fullDate: record.date
      };
    });
  }, [filteredData]);

  const averageWorkHours = useMemo(() => {
    // Use filteredData instead of attendanceData
    const validRecords = filteredData.filter((r) => r.workHours !== "-");
    if (validRecords.length === 0) return "-";

    const totalMinutes = validRecords.reduce((acc, record) => {
      const parts = record.workHours.split("h ");
      if (parts.length !== 2) return acc;
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1].replace("m", ""));
      return acc + hours * 60 + minutes;
    }, 0);

    const avgMinutes = totalMinutes / validRecords.length;
    const h = Math.floor(avgMinutes / 60);
    const m = Math.round(avgMinutes % 60);

    return `${h}h ${m}m`;
  }, [filteredData]);

  const totalWorkHours = useMemo(() => {
    const validRecords = filteredData.filter((r) => r.workHours !== "-");
    if (validRecords.length === 0) return "-";

    const totalMinutes = validRecords.reduce((acc, record) => {
      const parts = record.workHours.split("h ");
      if (parts.length !== 2) return acc;
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1].replace("m", ""));
      return acc + hours * 60 + minutes;
    }, 0);

    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);

    return `${h}h ${m}m`;
  }, [filteredData]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;

    const headers = ["Date", "Employee", "Day", "Clock In", "Clock Out", "Work Hours", "Status"];
    const csvRows = [headers.join(",")];

    for (const row of filteredData) {
      const values = [
        row.date,
        row.userName,
        row.day,
        row.clockIn,
        row.clockOut,
        row.workHours,
        row.status,
      ];
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `attendance-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getHoliday = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return holidays.find(h => h.date === dateStr);
  };

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const attendance = attendanceData.find(a => a.date === dateStr);
    const leave = leaves.find(l => {
      const start = new Date(l.from);
      const end = new Date(l.to);
      return date >= start && date <= end && (l.status === 'Approved' || l.status === 'approved');
    });

    let color = "bg-destructive/10 text-destructive border-destructive/20"; // Default Absent (Red)
    let reason = "Absent";
    
    // Check for Holiday (Sunday or Special Day)
    const holiday = getHoliday(date);
    if (getDay(date) === 0 || holiday) {
      color = "bg-orange-100 text-orange-700 border-orange-200";
      reason = holiday ? holiday.name : "Holiday";
    }

    // Check Attendance
    if (attendance) {
      if (attendance.status === 'present') {
        color = "bg-success/10 text-success border-success/20";
        reason = "Present";
      } else if (attendance.status === 'late') {
        color = "bg-warning/10 text-warning border-warning/20";
        reason = "Late";
      }
    }

    // Check Leave (Overrides absent/holiday if approved)
    if (leave) {
      color = "bg-success/10 text-success border-success/20"; // Green as requested
      reason = `On Leave: ${leave.reason}`;
    }

    // Future dates
    if (date > new Date()) {
      color = "bg-muted/50 text-muted-foreground border-muted";
      reason = "";
    }

    return { color, reason };
  };

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startDay = getDay(start); // 0 is Sunday
    const padding = Array(startDay).fill(null);
    return [...padding, ...days];
  }, [currentMonth]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Attendance History
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your daily attendance and work hours
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-success/10 border border-success/20">
            <p className="text-sm text-muted-foreground">Present Days</p>
            <p className="text-2xl font-bold font-display text-success">{filteredData.filter(d => d.status === 'present').length}</p>
          </div>
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
            <p className="text-sm text-muted-foreground">Late Arrivals</p>
            <p className="text-2xl font-bold font-display text-warning">{filteredData.filter(d => d.status === 'late').length}</p>
          </div>
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-muted-foreground">Absent Days</p>
            <p className="text-2xl font-bold font-display text-destructive">{filteredData.filter(d => d.status === 'absent').length}</p>
          </div>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">Avg. Hours/Day</p>
            <p className="text-2xl font-bold font-display text-primary">{averageWorkHours}</p>
          </div>
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold font-display text-accent">{totalWorkHours}</p>
          </div>
        </div>

        {/* Calendar View */}
        <div className="rounded-xl border bg-card shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-lg">Attendance Calendar</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium min-w-[100px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`pad-${i}`} className="h-24" />;
              const { color, reason } = getDayStatus(date);
              const holiday = getHoliday(date);
              return (
                <div 
                  key={date.toISOString()} 
                  className={`h-24 border rounded-lg p-2 flex flex-col justify-between transition-colors hover:opacity-80 cursor-pointer ${color}`} 
                  title={reason}
                  onClick={() => {
                    if (holiday) toast.info(`${holiday.name} (${holiday.type || 'Holiday'})`);
                    else if (reason) toast.info(reason);
                  }}
                >
                  <span className={`text-sm font-medium ${isToday(date) ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>{format(date, 'd')}</span>
                  {reason && <span className="text-xs truncate font-medium">{reason}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Work Hours Chart */}
        <div className="rounded-xl border bg-card shadow-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Daily Work Hours</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="halfday">Half Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Attendance Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.date} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{record.date}</TableCell>
                  <TableCell>{record.userName}</TableCell>
                  <TableCell>{record.day}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {record.clockIn}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {record.clockOut}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{record.workHours}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[record.status as keyof typeof statusStyles]}
                    >
                      {statusLabels[record.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing recent records
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
