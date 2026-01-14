import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface PendingApprovalsProps {
  approvals: any[];
}

export function PendingApprovals({ approvals }: PendingApprovalsProps) {
  return (
    <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h3 className="font-display font-semibold text-lg">
            Pending Approvals
          </h3>
        </div>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
          {approvals.length} pending
        </Badge>
      </div>
      <div className="divide-y">
        {approvals.length > 0 ? approvals.map((item) => (
          <div
            key={item.id}
            className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={item.photoURL} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {item.userName?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{item.userName || "Unknown User"}</p>
                <p className="text-sm text-muted-foreground">{item.type === 'leave' ? `${item.type} - ${item.from}` : 
                  item.type === 'increment' ? `Increment: ${item.expectedAmount}` :
                  `Resignation`}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mr-2">
                {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
              </span>
              <Button size="sm" variant="ghost" className="text-success hover:bg-success/10">
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )) : (
          <div className="p-4 text-center text-muted-foreground text-sm">No pending approvals</div>
        )}
      </div>
    </div>
  );
}