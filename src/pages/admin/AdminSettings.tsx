import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminSettings() {
  const db = getFirestore();
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowWeekendAccess: false,
    emailNotifications: true,
    autoApproveLeave: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, "settings", "general"));
      if (snap.exists()) {
        setSettings(snap.data() as any);
      }
    };
    fetchSettings();
  }, [db]);

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "general"), settings);
      toast.success("Settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">System configuration and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage global system behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Disable access for non-admin users</p>
              </div>
              <Switch checked={settings.maintenanceMode} onCheckedChange={() => handleToggle('maintenanceMode')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekend Access</Label>
                <p className="text-sm text-muted-foreground">Allow employees to login on weekends</p>
              </div>
              <Switch checked={settings.allowWeekendAccess} onCheckedChange={() => handleToggle('allowWeekendAccess')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email alerts for important events</p>
              </div>
              <Switch checked={settings.emailNotifications} onCheckedChange={() => handleToggle('emailNotifications')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve Leave</Label>
                <p className="text-sm text-muted-foreground">Automatically approve leave requests under 2 days</p>
              </div>
              <Switch checked={settings.autoApproveLeave} onCheckedChange={() => handleToggle('autoApproveLeave')} />
            </div>

            <div className="pt-4">
              <Button onClick={saveSettings}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}