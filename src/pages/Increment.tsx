import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, Calendar, IndianRupee } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const incrementHistory = [
  {
    id: 1,
    date: "Jan 2024",
    amount: 5000,
    percentage: 12,
    newSalary: 45000,
    status: "Approved",
    effectiveDate: "2024-01-01",
  },
  {
    id: 2,
    date: "Jan 2023",
    amount: 3500,
    percentage: 10,
    newSalary: 40000,
    status: "Approved",
    effectiveDate: "2023-01-01",
  },
];

export default function Increment() {
  const { user } = useAuth();
  const db = getFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ expectedAmount: "", reason: "" });

  const handleRequestIncrement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    
    try {
      await addDoc(collection(db, "increments"), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0],
        currentSalary: 45000, // Hardcoded for now as per UI
        ...formData,
        status: "pending",
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp()
      });

      setIsLoading(false);
      setIsDialogOpen(false);
      toast.success("Increment request submitted successfully!", {
        description: "Your request has been sent to HR for review.",
      });
    } catch (error) {
      toast.error("Failed to submit request");
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Salary Increments
            </h1>
            <p className="text-muted-foreground mt-1">
              View your salary revision history and upcoming increments
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                Request Increment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request Salary Increment</DialogTitle>
                <DialogDescription>
                  Submit a request for salary revision. This will be sent to HR for approval.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRequestIncrement} className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-salary">Current Salary</Label>
                  <Input id="current-salary" value="₹45,000" disabled className="bg-muted" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expected-amount">Expected Amount / Percentage</Label>
                  <Input id="expected-amount" placeholder="e.g. 50000 or 15%" required onChange={(e) => setFormData({...formData, expectedAmount: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">Reason for Increment</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="Describe your achievements and why you deserve an increment..." 
                    className="min-h-[100px]"
                    required 
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {/* Current Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Increment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  12%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Applied in Jan 2024</p>
              </CardContent>
            </Card>
          </div>

          {/* History List */}
          <Card>
            <CardHeader>
              <CardTitle>Increment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {incrementHistory.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-success/10 rounded-full">
                        <IndianRupee className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Annual Appraisal - {item.date}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          Effective: {item.effectiveDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-foreground">+₹{item.amount.toLocaleString()}</p>
                        <p className="text-sm text-success">New Salary: ₹{item.newSalary.toLocaleString()}</p>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">{item.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}