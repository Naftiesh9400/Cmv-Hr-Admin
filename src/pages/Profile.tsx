import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getFirestore, doc, getDoc, updateDoc, onSnapshot, collection, query, orderBy, getDocs } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Profile() {
  const { user } = useAuth();
  const db = getFirestore();
  const [loading, setLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    designation: "",
    department: "",
    photoURL: "",
    status: "Available",
    reportsTo: ""
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      const q = query(collection(db, "users"), orderBy("displayName"));
      const snapshot = await getDocs(q);
      const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllEmployees(employees);
    };
    fetchEmployees();
  }, [db]);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
          setFormData({
            displayName: data.displayName || user.displayName || user.email?.split('@')[0] || "",
            phone: data.phone || "",
            designation: data.designation || "Software Engineer",
            department: data.department || "",
            photoURL: data.photoURL || user.photoURL || "",
            status: data.status || "Available",
            reportsTo: data.reportsTo || ""
          });
        }
      }
    });

    return () => unsubscribe();
  }, [user, db]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: formData.displayName,
        phone: formData.phone,
        designation: formData.designation,
        department: formData.department,
        photoURL: formData.photoURL,
        status: formData.status,
        reportsTo: formData.reportsTo
      });

      const auth = getAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName,
          photoURL: formData.photoURL,
        });
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials = formData.displayName 
    ? formData.displayName.substring(0, 2).toUpperCase() 
    : (user?.email?.substring(0, 2).toUpperCase() || "US");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg relative overflow-hidden">
                  <AvatarImage src={formData.photoURL} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="photoURL">Avatar URL</Label>
                  <Input 
                    id="photoURL" 
                    placeholder="https://example.com/image.png" 
                    value={formData.photoURL} 
                    onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })} 
                  />
                  <p className="text-xs text-muted-foreground">Enter a direct URL for your profile picture.</p>
                </div>
              </div>
              
              <Separator />

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.displayName} 
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={user?.email || ""} disabled className="bg-muted" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="+1 (555) 000-0000" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input 
                      id="designation" 
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input 
                      id="department" 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      placeholder="e.g. Engineering"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Current Status</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="In a meeting">In a meeting</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Working Remotely">Working Remotely</SelectItem>
                        <SelectItem value="Do Not Disturb">Do Not Disturb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reportsTo">Reports To</Label>
                  <Select value={formData.reportsTo} onValueChange={(val) => setFormData({...formData, reportsTo: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {allEmployees.filter(emp => emp.id !== user?.uid).map((emp) => (
                        <SelectItem key={emp.id} value={emp.displayName || emp.email}>{emp.displayName || emp.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional settings or info can go here in the second column */}
        </div>
      </div>
    </DashboardLayout>
  );
}