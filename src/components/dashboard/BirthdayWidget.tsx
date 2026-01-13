import { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { Gift, Cake } from "lucide-react";
import { format, subDays } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function BirthdayWidget() {
  const db = getFirestore();
  const [birthdayEmployees, setBirthdayEmployees] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data());
      const today = new Date();      
      const sevenDaysAgo = subDays(today, 7);

      const birthdays = users.filter(user => {
        if (!user.dob) return false;
        const dob = new Date(user.dob);
        // Create a date for this year's birthday to compare
        const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        
        // Check if the birthday is within the last 7 days and not in the future
        return thisYearBirthday >= sevenDaysAgo && thisYearBirthday <= today;
      }).map(user => {
        const dob = new Date(user.dob);
        return {
          ...user,
          // Format the birthday for display
          birthdayDate: format(new Date(today.getFullYear(), dob.getMonth(), dob.getDate()), "MMM dd")
        };
      }).sort((a, b) => new Date(b.birthdayDate).getTime() - new Date(a.birthdayDate).getTime()); // Sort by most recent
      setBirthdayEmployees(birthdays.slice(0, 5)); // Show up to 5 recent birthdays
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
        <h3 className="font-display font-semibold text-lg">Recent Birthdays</h3>
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
              <p className="font-medium text-foreground">Happy Birthday, {emp.displayName}! ({emp.birthdayDate})</p>
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