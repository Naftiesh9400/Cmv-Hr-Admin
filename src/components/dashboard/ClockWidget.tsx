import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Wifi } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

interface ClockWidgetProps {
  isClockedIn?: boolean;
  onClockIn?: () => void;
  onClockOut?: () => void;
  onWorkHoursChange?: (hours: string) => void;
}

export function ClockWidget({
  isClockedIn = false,
  onClockIn,
  onClockOut,
  onWorkHoursChange,
}: ClockWidgetProps) {
  const { user } = useAuth();
  const db = getFirestore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(isClockedIn);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [workHours, setWorkHours] = useState("00:00:00");
  const [loading, setLoading] = useState(true);
  const [locationInfo, setLocationInfo] = useState({
    city: "Detecting...",
    ip: "Detecting..."
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];
      const docRef = doc(db, "attendance", `${user.uid}_${today}`);

      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.clockIn) {
            const startTime = data.clockIn.toDate();
            setClockInTime(startTime);
            
            if (!data.clockOut) {
              setClockedIn(true);
            } else {
              setClockedIn(false);
              setClockInTime(null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user, db]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        setLocationInfo({
          city: data.city && data.region_code ? `${data.city}, ${data.region_code}` : "Unknown Location",
          ip: data.ip || "Unknown IP",
        });
      } catch (error) {
        setLocationInfo({ city: "Unknown Location", ip: "Unknown IP" });
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (!clockInTime) {
      setWorkHours("00:00:00");
      onWorkHoursChange?.("0h 0m");
      return;
    }

    const workHoursTimer = setInterval(() => {
      const diff = new Date().getTime() - clockInTime.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setWorkHours(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      onWorkHoursChange?.(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(workHoursTimer);
  }, [clockInTime, onWorkHoursChange]);

  const handleClockIn = async () => {
    if (!user) return;

    const now = new Date();
    const day = now.getDay();
    const dateString = now.toISOString().split("T")[0];
    const holidays = ["2024-01-01", "2024-01-26", "2024-08-15", "2024-10-02", "2024-12-25"];

    if (day === 0 || day === 6) {
      toast.error("Check-in is not allowed on weekends.");
      return;
    }

    if (holidays.includes(dateString)) {
      toast.error("Check-in is not allowed on holidays.");
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const docRef = doc(db, "attendance", `${user.uid}_${today}`);
      const now = new Date();

      await setDoc(docRef, {
        userId: user.uid,
        date: today,
        clockIn: serverTimestamp(),
        status: "present",
      });

      setClockedIn(true);
      setClockInTime(now);
      toast.success("Clocked in successfully!", {
        description: `You're now checked in at ${now.toLocaleTimeString()}`,
      });
      onClockIn?.();
    } catch (error) {
      toast.error("Failed to clock in");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const docRef = doc(db, "attendance", `${user.uid}_${today}`);

      await updateDoc(docRef, {
        clockOut: serverTimestamp(),
      });

      setClockedIn(false);
      toast.success("Clocked out successfully!", {
        description: `Total work hours: ${workHours}`,
      });
      setClockInTime(null);
      setWorkHours("00:00:00");
      onWorkHoursChange?.("0h 0m");
      onClockOut?.();
    } catch (error) {
      toast.error("Failed to clock out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-card border bg-card">
      {/* Header */}
      <div className="gradient-hero p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Time Clock</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              clockedIn
                ? "bg-success/20 text-success"
                : "bg-primary-foreground/20 text-primary-foreground"
            }`}
          >
            {clockedIn ? "Working" : "Not Clocked In"}
          </span>
        </div>

        <div className="text-center space-y-2">
          <p className="text-5xl font-display font-bold tracking-tight">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-primary-foreground/70">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Work Hours Counter */}
        {clockedIn && (
          <div className="text-center p-4 rounded-xl bg-muted">
            <p className="text-sm text-muted-foreground mb-1">
              Today's Work Hours
            </p>
            <p className="text-3xl font-display font-bold text-foreground tabular-nums">
              {workHours}
            </p>
          </div>
        )}

        {/* Location & IP Info */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{locationInfo.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>{locationInfo.ip}</span>
          </div>
        </div>

        {/* Clock Button */}
        <Button
          variant={clockedIn ? "clock-out" : "clock-in"}
          size="xl"
          className="w-full"
          onClick={clockedIn ? handleClockOut : handleClockIn}
          disabled={loading}
        >
          {clockedIn ? "Clock Out" : "Clock In"}
        </Button>

        {clockInTime && (
          <p className="text-center text-sm text-muted-foreground">
            Clocked in at{" "}
            <span className="font-medium text-foreground">
              {clockInTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}