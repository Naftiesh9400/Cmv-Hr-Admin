import { useState, useEffect } from "react";
import { getFirestore, collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export function HolidaysWidget() {
  const db = getFirestore();
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, "holidays"),
      where("date", ">=", today),
      orderBy("date", "asc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHolidays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [db]);

  if (holidays.length === 0) return null;

  return (
    <div className="rounded-xl p-6 shadow-card border bg-card">
      <div className="flex items-center gap-3 mb-4">
        <CalendarIcon className="w-6 h-6 text-primary" />
        <h3 className="font-display font-semibold text-lg">Upcoming Holidays</h3>
      </div>
      <div className="space-y-3">
        {holidays.map((holiday) => (
          <div key={holiday.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="font-medium text-foreground">{holiday.name}</span>
            <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded border">
              {format(new Date(holiday.date), "MMM dd, yyyy")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}