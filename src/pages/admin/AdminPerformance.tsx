import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getFirestore, collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import { toast } from "sonner";

export default function AdminPerformance() {
  const db = getFirestore();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: "5",
    title: "",
    feedback: "",
    newScore: ""
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [db]);

  const handleOpenReview = (employee: any) => {
    setSelectedEmployee(employee);
    setReviewData({
        rating: "5",
        title: "",
        feedback: "",
        newScore: employee.performance?.score?.toString() || "0"
    });
    setIsDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedEmployee || !user) return;

    try {
        // 1. Add review document
        await addDoc(collection(db, "reviews"), {
            userId: selectedEmployee.id,
            reviewerId: user.uid,
            reviewerName: user.displayName || "Admin",
            rating: parseInt(reviewData.rating),
            title: reviewData.title,
            feedback: reviewData.feedback,
            createdAt: serverTimestamp()
        });

        // 2. Update user performance score
        const currentScore = selectedEmployee.performance?.score || 0;
        const newScoreVal = parseInt(reviewData.newScore);
        const trend = newScoreVal - currentScore;

        await updateDoc(doc(db, "users", selectedEmployee.id), {
            performance: {
                score: newScoreVal,
                trend: trend
            }
        });

        // 3. Notify user
        await addDoc(collection(db, "notifications"), {
            recipientId: selectedEmployee.id,
            title: "New Performance Review",
            message: `You received a new performance review from ${user.displayName || "Admin"}`,
            type: "performance",
            read: false,
            createdAt: serverTimestamp(),
            link: "/performance"
        });

        toast.success("Review submitted successfully");
        setIsDialogOpen(false);
    } catch (error) {
        console.error(error);
        toast.error("Failed to submit review");
    }
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Performance Management</h1>
          <p className="text-muted-foreground mt-1">Evaluate and track employee performance</p>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Current Score</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={emp.photoURL} />
                        <AvatarFallback>{emp.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.displayName}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{emp.role || "Employee"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">{emp.performance?.score || 0}</span>
                        <span className="text-muted-foreground">/ 100</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {emp.performance?.trend ? (
                        <Badge variant="outline" className={emp.performance.trend >= 0 ? "text-success border-success/20" : "text-destructive border-destructive/20"}>
                            {emp.performance.trend > 0 ? "+" : ""}{emp.performance.trend}%
                        </Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleOpenReview(emp)}>
                        <Star className="w-4 h-4 mr-2" /> Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Performance Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label>Employee</Label>
                        <Input value={selectedEmployee?.displayName || ""} disabled />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Update Score (0-100)</Label>
                            <Input type="number" min="0" max="100" value={reviewData.newScore} onChange={e => setReviewData({...reviewData, newScore: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Rating (1-5)</Label>
                            <Select value={reviewData.rating} onValueChange={val => setReviewData({...reviewData, rating: val})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 - Poor</SelectItem>
                                    <SelectItem value="2">2 - Fair</SelectItem>
                                    <SelectItem value="3">3 - Good</SelectItem>
                                    <SelectItem value="4">4 - Very Good</SelectItem>
                                    <SelectItem value="5">5 - Excellent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Review Title</Label>
                        <Input placeholder="e.g. Monthly Evaluation" value={reviewData.title} onChange={e => setReviewData({...reviewData, title: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Feedback</Label>
                        <Textarea placeholder="Detailed feedback..." value={reviewData.feedback} onChange={e => setReviewData({...reviewData, feedback: e.target.value})} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmitReview}>Submit Review</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}