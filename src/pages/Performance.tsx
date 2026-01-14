import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star } from "lucide-react";

export default function Performance() {
  const { user } = useAuth();
  const db = getFirestore();
  const [stats, setStats] = useState({ score: 0, trend: 0 });
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch user stats
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats(data.performance || { score: 0, trend: 0 });
      }
    });

    // Fetch reviews
    const q = query(collection(db, "reviews"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubReviews = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubUser();
      unsubReviews();
    };
  }, [user, db]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">My Performance</h1>
            <p className="text-muted-foreground mt-1">Track your performance metrics and feedback</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="text-4xl font-bold">{stats.score}/100</div>
                        {stats.trend !== 0 && (
                            <div className={`flex items-center gap-1 text-sm ${stats.trend > 0 ? 'text-success' : 'text-destructive'}`}>
                                {stats.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {Math.abs(stats.trend)}% vs last month
                            </div>
                        )}
                    </div>
                    <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${stats.score}%` }} />
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Performance Rating</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Star className="w-8 h-8 text-warning fill-warning" />
                        <span className="text-2xl font-bold">
                            {stats.score >= 90 ? "Excellent" : stats.score >= 75 ? "Good" : stats.score >= 60 ? "Average" : "Needs Improvement"}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Based on your overall score</p>
                </CardContent>
            </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Reviews</h2>
            {reviews.length > 0 ? (
                reviews.map(review => (
                    <Card key={review.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base">{review.title || "Performance Review"}</CardTitle>
                                    <CardDescription>By {review.reviewerName} on {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : "-"}</CardDescription>
                                </div>
                                <Badge variant="outline" className="flex gap-1">
                                    <Star className="w-3 h-3 fill-current" /> {review.rating}/5
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{review.feedback}</p>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/10">
                    No reviews found.
                </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}