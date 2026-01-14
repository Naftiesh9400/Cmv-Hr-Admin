import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Calendar as CalendarIcon, Search, FileDown, MapPin, Globe } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminAttendance() {
  const db = getFirestore();
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        // Fetch users to map names and emails
        const usersSnap = await getDocs(collection(db, "users"));
        const usersMap: Record<string, any> = {};
        usersSnap.forEach(doc => {
          usersMap[doc.id] = doc.data();
        });

        // In a real app, you'd likely want pagination here
        const q = query(collection(db, "attendance"), orderBy("date", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => {
          const d = doc.data();
          
          let firstClockIn = null;
          const userData = usersMap[d.userId] || {};
          let lastClockOut = null;
          let totalMs = 0;

          if (d.sessions && Array.isArray(d.sessions) && d.sessions.length > 0) {
            const firstSession = d.sessions[0];
            firstClockIn = firstSession.clockIn ? firstSession.clockIn.toDate() : null;
            
            const lastSession = d.sessions[d.sessions.length - 1];
            lastClockOut = lastSession.clockOut ? lastSession.clockOut.toDate() : null;

            d.sessions.forEach((s: any) => {
              if (s.clockIn && s.clockOut) {
                totalMs += s.clockOut.toDate().getTime() - s.clockIn.toDate().getTime();
              }
            });
          } else {
            // Fallback for legacy data
            firstClockIn = d.clockIn ? d.clockIn.toDate() : null;
            lastClockOut = d.clockOut ? d.clockOut.toDate() : null;
            if (firstClockIn && lastClockOut) totalMs = lastClockOut.getTime() - firstClockIn.getTime();
          }

          let workHours = "-";
          if (totalMs > 0) {
            const hours = Math.floor(totalMs / (1000 * 60 * 60));
            const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
            workHours = `${hours}h ${minutes}m`;
          }

          return {
            id: doc.id,
            userId: d.userId,
            userName: userData.displayName || d.userName || "Unknown",
            userEmail: userData.email || "",
            userAvatar: userData.photoURL,
            date: d.date,
            clockIn: firstClockIn ? format(firstClockIn, "hh:mm a") : "-",
            clockOut: lastClockOut ? format(lastClockOut, "hh:mm a") : "-",
            workHours,
            location: d.location || "Unknown",
            ip: d.ip || "Unknown",
            status: d.status || "absent"
          };
        });
        setAttendanceData(data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };
    fetchAllAttendance();
  }, [db]);

  const filteredData = attendanceData.filter(record =>
    record.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.date?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadCSV = () => {
    const headers = ["User ID", "Name", "Email", "Date", "Clock In", "Clock Out", "Work Hours", "Location", "IP", "Status"];
    const csvRows = [headers.join(",")];

    for (const record of filteredData) {
      const values = [
        record.userId,
        record.userName,
        record.userEmail,
        record.date,
        record.clockIn,
        record.clockOut,
        record.workHours,
        record.location,
        record.ip,
        record.status
      ];
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Attendance report downloaded successfully");
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Attendance Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor employee check-ins and work hours
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <FileDown className="w-4 h-4 mr-2" /> Download CSV
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Name, Email or Date..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? filteredData.map((record) => (
                <TableRow key={record.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border">
                        <AvatarImage src={record.userAvatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {record.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{record.userName}</span>
                        <span className="text-xs text-muted-foreground">{record.userEmail}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-2"><CalendarIcon className="w-3 h-3 text-muted-foreground" /> {record.date}</TableCell>
                  <TableCell>{record.clockIn}</TableCell>
                  <TableCell>{record.clockOut}</TableCell>
                  <TableCell className="font-medium">{record.workHours}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground" title={record.location}>
                      <MapPin className="w-3 h-3" /> {record.location.substring(0, 15)}{record.location.length > 15 ? '...' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" /> {record.ip}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={record.status === 'present' ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>{record.status}</Badge>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No attendance records found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}