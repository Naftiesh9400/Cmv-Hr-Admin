import { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { PartyPopper, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function WorkAnniversaryWidget() {
  const db = getFirestore();
  const [anniversaryEmployees, setAnniversaryEmployees] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data());
      const today = new Date();
      const todayMonth = today.getMonth();
      const todayDate = today.getDate();
      const todayYear = today.getFullYear();

      const anniversaries = users.filter(user => {
        if (!user.joinDate) return false;
        const joinDate = new Date(user.joinDate);
        // Check if month and day match, and year is different (not the joining year itself)
        return joinDate.getMonth() === todayMonth && 
               joinDate.getDate() === todayDate && 
               joinDate.getFullYear() < todayYear;
      }).map(user => ({
        ...user,
        years: todayYear - new Date(user.joinDate).getFullYear()
      }));
      setAnniversaryEmployees(anniversaries);
    });

    return () => unsub();
  }, [db]);

  if (anniversaryEmployees.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl p-6 shadow-card border bg-card mt-6">
      <div className="flex items-center gap-3 mb-4">
        <PartyPopper className="w-6 h-6 text-primary" />
        <h3 className="font-display font-semibold text-lg">Work Anniversaries!</h3>
      </div>
      <div className="space-y-4">
        {anniversaryEmployees.map((emp) => (
          <div key={emp.email} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
            <Avatar>
              <AvatarImage src={emp.photoURL} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {emp.displayName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">Happy {emp.years} Year Anniversary, {emp.displayName}!</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Thank you for your dedication!
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}