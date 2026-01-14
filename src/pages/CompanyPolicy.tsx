import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, ChevronDown, Check, Users } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function CompanyPolicy() {
  const { user } = useAuth();
  const db = getFirestore();
  const [policies, setPolicies] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role === 'admin') {
          setIsAdmin(true);
        }
      }
    };
    checkAdmin();
  }, [user, db]);

  useEffect(() => {
    const q = query(collection(db, "policies"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPolicies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const map: Record<string, string> = {};
      snap.forEach(d => {
        map[d.id] = d.data().displayName || d.data().email;
      });
      setUsersMap(map);
    });
    return () => unsub();
  }, [isAdmin, db]);

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingPolicy) {
        await updateDoc(doc(db, "policies", editingPolicy.id), {
          title: formData.title,
          content: formData.content,
          updatedAt: new Date()
        });
        toast.success("Policy updated");
      } else {
        await addDoc(collection(db, "policies"), {
          title: formData.title,
          content: formData.content,
          createdAt: new Date()
        });
        toast.success("Policy added");
      }
      setIsDialogOpen(false);
      setEditingPolicy(null);
      setFormData({ title: "", content: "" });
    } catch (error) {
      toast.error("Failed to save policy");
    }
  };

  const handleEdit = (policy: any) => {
    setEditingPolicy(policy);
    setFormData({ title: policy.title, content: policy.content });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    try {
      await deleteDoc(doc(db, "policies", id));
      toast.success("Policy deleted");
    } catch (error) {
      toast.error("Failed to delete policy");
    }
  };

  const openAddDialog = () => {
    setEditingPolicy(null);
    setFormData({ title: "", content: "" });
    setIsDialogOpen(true);
  };

  const togglePolicy = (id: string) => {
    setExpandedPolicies(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMarkAsRead = async (policyId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "policies", policyId), {
        readBy: arrayUnion(user.uid)
      });
      toast.success("Policy acknowledged");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  return (
    <DashboardLayout isAdmin={isAdmin}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Company Policy</h1>
            <p className="text-muted-foreground">
              General company policies and guidelines.
            </p>
          </div>
          {isAdmin && (
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="w-4 h-4" /> Add Policy
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {policies.map((policy) => {
            const isRead = policy.readBy?.includes(user?.uid);
            const readCount = policy.readBy?.length || 0;

            return (
            <Card key={policy.id} className="overflow-hidden transition-all duration-200">
              <CardHeader 
                className="flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => togglePolicy(policy.id)}
              >
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl select-none">{policy.title}</CardTitle>
                  {!isAdmin && isRead && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                      <Check className="w-3 h-3" /> Read
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="secondary" className="gap-1">
                      <Users className="w-3 h-3" /> {readCount}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {isAdmin && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(policy)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(policy.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${expandedPolicies.has(policy.id) ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>
              {expandedPolicies.has(policy.id) && (
                <CardContent className="pt-0 border-t">
                  <div className="whitespace-pre-wrap text-muted-foreground mt-6">
                    {policy.content}
                  </div>
                  
                  {!isAdmin && !isRead && (
                    <div className="mt-6 flex justify-end">
                      <Button onClick={() => handleMarkAsRead(policy.id)} className="gap-2">
                        <Check className="w-4 h-4" /> Mark as Read
                      </Button>
                    </div>
                  )}

                  {isAdmin && policy.readBy && policy.readBy.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Read by:</p>
                      <div className="flex flex-wrap gap-2">
                        {policy.readBy.map((uid: string) => (
                          <Badge key={uid} variant="outline">
                            {usersMap[uid] || "Unknown User"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )})}
          {policies.length === 0 && (
             <div className="text-center py-12 text-muted-foreground">
               No policies found.
             </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingPolicy ? "Edit Policy" : "Add New Policy"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Policy Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Work from Home Policy"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea 
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Enter policy details..."
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Policy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}