import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, addDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Plus, Upload, FileJson } from "lucide-react";

export default function AdminSettings() {
  const db = getFirestore();
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowWeekendAccess: false,
    emailNotifications: true,
    autoApproveLeave: false,
    birthdayMessage: "",
    workAnniversaryMessage: ""
  });
  const [holidays, setHolidays] = useState<any[]>([]);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, "settings", "general"));
      if (snap.exists()) {
        setSettings(prev => ({ ...prev, ...snap.data() }));
      }
    };
    fetchSettings();
  }, [db]);

  useEffect(() => {
    const q = query(collection(db, "holidays"), orderBy("date"));
    const unsub = onSnapshot(q, (snap) => {
      setHolidays(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
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

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast.error("Please fill in both name and date");
      return;
    }
    try {
      await addDoc(collection(db, "holidays"), newHoliday);
      setNewHoliday({ name: "", date: "" });
      toast.success("Holiday added");
    } catch (error) {
      toast.error("Failed to add holiday");
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await deleteDoc(doc(db, "holidays", id));
      toast.success("Holiday deleted");
    } catch (error) {
      toast.error("Failed to delete holiday");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please upload a valid JSON file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          toast.error("Could not read file content.");
          return;
        }
        const jsonContent = JSON.parse(content);
        
        // Handle both array and object with holidays property
        const holidaysToUpload = Array.isArray(jsonContent) ? jsonContent : (jsonContent.holidays || []);

        if (!Array.isArray(holidaysToUpload) || !holidaysToUpload.every((h: any) => h.name && h.date)) {
          toast.error("Invalid JSON format. Expected an array of objects with 'name' and 'date' properties.");
          return;
        }

        if (!confirm(`This will add ${holidaysToUpload.length} holidays from the file. Are you sure?`)) return;

        const batch = writeBatch(db);
        const currentYear = new Date().getFullYear();

        holidaysToUpload.forEach((h: any) => {
          const docRef = doc(collection(db, "holidays"));
          let dateStr = h.date;
          
          // Attempt to parse "DD Month" format (e.g., "26 January") to YYYY-MM-DD
          const dateMatch = dateStr.match(/^(\d{1,2})\s+([a-zA-Z]+)$/);
          if (dateMatch) {
             const day = parseInt(dateMatch[1]);
             const monthName = dateMatch[2];
             const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
             if (!isNaN(monthIndex)) {
                 const d = new Date(currentYear, monthIndex, day);
                 const y = d.getFullYear();
                 const m = String(d.getMonth() + 1).padStart(2, '0');
                 const da = String(d.getDate()).padStart(2, '0');
                 dateStr = `${y}-${m}-${da}`;
             }
          }

          batch.set(docRef, { 
            name: h.name, 
            date: dateStr,
            type: h.type || "Public Holiday" 
          });
        });
        await batch.commit();
        toast.success(`${holidaysToUpload.length} holidays uploaded successfully.`);
      } catch (error) {
        console.error("Error processing JSON file:", error);
        toast.error("Failed to process JSON file. Make sure it is correctly formatted.");
      }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = "";
  };

  const handlePopulateDefaults = async () => {
    if (!confirm("This will add standard Indian holidays for 2025 to the list. Continue?")) return;
    
    const year = 2025;
    const defaults = [
      { name: "Makar Sankranti / Pongal", date: `${year}-01-14` },
      { name: "Republic Day", date: `${year}-01-26` },
      { name: "Holi", date: `${year}-03-14` },
      { name: "Good Friday", date: `${year}-04-18` },
      { name: "Eid-ul-Fitr", date: `${year}-03-31` },
      { name: "Buddha Purnima", date: `${year}-05-12` },
      { name: "Eid-ul-Adha (Bakrid)", date: `${year}-06-07` },
      { name: "Muharram", date: `${year}-07-06` },
      { name: "Independence Day", date: `${year}-08-15` },
      { name: "Raksha Bandhan", date: `${year}-08-09` },
      { name: "Janmashtami", date: `${year}-08-16` },
      { name: "Ganesh Chaturthi", date: `${year}-08-27` },
      { name: "Gandhi Jayanti", date: `${year}-10-02` },
      { name: "Dussehra (Vijayadashami)", date: `${year}-10-02` },
      { name: "Diwali (Deepavali)", date: `${year}-10-20` },
      { name: "Guru Nanak Jayanti", date: `${year}-11-05` },
      { name: "Christmas", date: `${year}-12-25` },
    ];

    try {
      const batch = writeBatch(db);
      defaults.forEach(h => {
        const docRef = doc(collection(db, "holidays"));
        batch.set(docRef, h);
      });
      await batch.commit();
      toast.success("Standard holidays added");
    } catch (error) {
      console.error(error);
      toast.error("Failed to populate holidays");
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

            <div className="space-y-2 pt-4 border-t">
              <Label>Birthday Message Template</Label>
              <Input 
                value={settings.birthdayMessage || ""} 
                onChange={(e) => setSettings({...settings, birthdayMessage: e.target.value})}
                placeholder="Happy Birthday to {name}! 🎂"
              />
              <p className="text-xs text-muted-foreground">Use {'{name}'} as a placeholder for employee name.</p>
            </div>

            <div className="space-y-2">
              <Label>Work Anniversary Message Template</Label>
              <Input 
                value={settings.workAnniversaryMessage || ""} 
                onChange={(e) => setSettings({...settings, workAnniversaryMessage: e.target.value})}
                placeholder="Congratulations to {name} on completing {years} years! 🎉"
              />
              <p className="text-xs text-muted-foreground">Use {'{name}'} for name and {'{years}'} for number of years.</p>
            </div>

            <div className="pt-4">
              <Button onClick={saveSettings}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Holiday Management</CardTitle>
                <CardDescription>Manage public holidays and special events</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePopulateDefaults} className="gap-2">
                  <Upload className="w-4 h-4" /> Populate Defaults
                </Button>
                <Button variant="outline" size="sm" onClick={handleUploadClick} className="gap-2">
                  <FileJson className="w-4 h-4" /> Upload JSON
                </Button>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/json"
              className="hidden"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label>Holiday Name</Label>
                <Input 
                  placeholder="e.g. Diwali" 
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                />
              </div>
              <Button onClick={handleAddHoliday} className="gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Holiday Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.length > 0 ? holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">{holiday.date}</TableCell>
                      <TableCell>{holiday.name}</TableCell>
                      <TableCell>{holiday.type || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteHoliday(holiday.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        No holidays added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}