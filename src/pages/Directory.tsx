import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, Briefcase, UserCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Directory() {
  const db = getFirestore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("displayName"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(users);
    });
    return () => unsubscribe();
  }, [db]);

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDepartment === "all" || employee.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Team Directory
            </h1>
            <p className="text-muted-foreground mt-1">
              Find and connect with your colleagues
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or email..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept as string} value={dept as string}>{dept as string}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employee.photoURL} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {employee.displayName?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 overflow-hidden flex-1">
                  <CardTitle className="text-base font-semibold truncate">
                    {employee.displayName || "Unknown User"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                    <Briefcase className="w-3 h-3 flex-shrink-0" />
                    {employee.designation || employee.role || "Employee"}
                  </p>
                </div>
                {employee.status && (
                  <Badge variant="outline" className={`whitespace-nowrap ml-auto ${
                    employee.status === 'Available' ? 'bg-success/10 text-success border-success/20' :
                    employee.status === 'In a meeting' ? 'bg-warning/10 text-warning border-warning/20' :
                    employee.status === 'Do Not Disturb' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {employee.status}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                {employee.reportsTo && employee.reportsTo !== "none" && (
                  <div className="flex items-center gap-2 text-muted-foreground pt-1">
                    <UserCheck className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Reports to: {employee.reportsTo}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}