import { useState, useEffect } from "react";
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";

interface LogEntry {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: any;
  type: "info" | "warning" | "error" | "success";
}

export function LogViewer() {
  const db = getFirestore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "system_logs"), orderBy("timestamp", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry)));
    });
    return () => unsubscribe();
  }, [db]);

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    return log.type === filter;
  });

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "error": return "destructive";
      case "warning": return "secondary";
      case "success": return "default";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Logs
        </CardTitle>
        <CardDescription>Recent system activities and events</CardDescription>
        <RadioGroup defaultValue="all" onValueChange={setFilter} className="flex items-center space-x-4 pt-2">
          <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="all" /><Label htmlFor="all">All</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="error" id="error" /><Label htmlFor="error">Error</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="success" id="success" /><Label htmlFor="success">Success</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="info" id="info" /><Label htmlFor="info">Info</Label></div>
        </RadioGroup>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {filteredLogs.length > 0 ? filteredLogs.map((log) => (
              <div key={log.id} className="flex flex-col space-y-1 border-b pb-2 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{log.action}</span>
                  <Badge variant={getBadgeVariant(log.type) as any} className="text-[10px] px-1 py-0 h-5">{log.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{log.details}</p>
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>User: {log.user}</span><span>{log.timestamp ? formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true }) : 'Just now'}</span></div>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No logs found.</p>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}