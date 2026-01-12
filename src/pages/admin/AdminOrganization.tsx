import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Trash2, Plus, Building2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function AdminOrganization() {
  const db = getFirestore();
  const [departments, setDepartments] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [newDept, setNewDept] = useState("");
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "" });

  useEffect(() => {
    const unsubDept = onSnapshot(query(collection(db, "departments"), orderBy("name")), (snap) => {
      setDepartments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubHoliday = onSnapshot(query(collection(db, "holidays"), orderBy("date")), (snap) => {
      setHolidays(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubDept(); unsubHoliday(); };
  }, [db]);

  const addDepartment = async () => {
    if (!newDept) return;
    await addDoc(collection(db, "departments"), { name: newDept });
    setNewDept("");
    toast.success("Department added");
  };

  const deleteDepartment = async (id: string) => {
    await deleteDoc(doc(db, "departments", id));
    toast.success("Department removed");
  };

  const addHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    await addDoc(collection(db, "holidays"), newHoliday);
    setNewHoliday({ name: "", date: "" });
    toast.success("Holiday added");
  };

  const deleteHoliday = async (id: string) => {
    await deleteDoc(doc(db, "holidays", id));
    toast.success("Holiday removed");
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Organization</h1>
          <p className="text-muted-foreground mt-1">Manage company structure and calendar</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Departments</CardTitle>
              <CardDescription>Manage company departments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="New Department Name" value={newDept} onChange={e => setNewDept(e.target.value)} />
                <Button onClick={addDepartment}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-2">
                {departments.map(dept => (
                  <div key={dept.id} className="flex items-center justify-between p-2 border rounded-md">
                    <span>{dept.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteDepartment(dept.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Holidays</CardTitle>
              <CardDescription>Manage public holidays</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Input placeholder="Holiday Name" value={newHoliday.name} onChange={e => setNewHoliday({...newHoliday, name: e.target.value})} />
                <div className="flex gap-2">
                  <Input type="date" value={newHoliday.date} onChange={e => setNewHoliday({...newHoliday, date: e.target.value})} />
                  <Button onClick={addHoliday}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                {holidays.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">{h.name}</p>
                      <p className="text-xs text-muted-foreground">{h.date}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteHoliday(h.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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