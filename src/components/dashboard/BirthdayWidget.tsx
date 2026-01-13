import { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { Gift, Cake } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function BirthdayWidget() {
  const db = getFirestore();
  const [birthdayEmployees, setBirthdayEmployees] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data());
      const today = new Date();
      const todayMonth = today.getMonth();
      const todayDate = today.getDate();

      const birthdays = users.filter(user => {
        if (!user.dob) return false;
        // Create date object from YYYY-MM-DD string
        const dob = new Date(user.dob);
        // Compare month and day (date object's month is 0-indexed)
        return dob.getMonth() === todayMonth && dob.getDate() === todayDate;
      });
      setBirthdayEmployees(birthdays);
    });

    return () => unsub();
  }, [db]);

  if (birthdayEmployees.length === 0) {
    return null; // Don't render anything if there are no birthdays
  }

  return (
    <div className="rounded-xl p-6 shadow-card border bg-card">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6 text-primary" />
        <h3 className="font-display font-semibold text-lg">Today's Birthdays!</h3>
      </div>
      <div className="space-y-4">
        {birthdayEmployees.map((emp) => (
          <div key={emp.email} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
            <Avatar>
              <AvatarImage src={emp.photoURL} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {emp.displayName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">Happy Birthday, {emp.displayName}!</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Cake className="w-3 h-3" /> Wishing you a great day!
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}