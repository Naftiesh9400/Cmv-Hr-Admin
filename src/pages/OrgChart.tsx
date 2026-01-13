import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

interface Employee {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  designation: string;
  reportsTo?: string;
  children?: Employee[];
}

export default function OrgChart() {
  const db = getFirestore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tree, setTree] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchEmployees = async () => {
      const q = query(collection(db, "users"), orderBy("displayName"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(data);
      setLoading(false);
    };
    fetchEmployees();
  }, [db]);

  useEffect(() => {
    if (employees.length === 0) return;

    const buildTree = () => {
      const employeeMap = new Map<string, Employee>();
      // Initialize map and children array
      employees.forEach(emp => {
        // Use displayName or email as key since reportsTo stores name/email
        const key = emp.displayName || emp.email;
        if (key) {
            employeeMap.set(key, { ...emp, children: [] });
        }
      });

      const roots: Employee[] = [];

      employees.forEach(emp => {
        const currentKey = emp.displayName || emp.email;
        if (!currentKey) return;
        
        const current = employeeMap.get(currentKey);
        if (!current) return;

        const managerName = emp.reportsTo;
        
        if (managerName && managerName !== "none" && employeeMap.has(managerName)) {
          // Prevent self-referencing loop if someone reports to themselves
          if (managerName !== currentKey) {
              const manager = employeeMap.get(managerName);
              manager?.children?.push(current);
          } else {
              roots.push(current);
          }
        } else {
          roots.push(current);
        }
      });

      return roots;
    };

    setTree(buildTree() || []);
  }, [employees]);

  useEffect(() => {
    if (!searchQuery) {
      setExpandedNodes(new Set());
      return;
    }

    const newExpanded = new Set<string>();
    const employeeMap = new Map(employees.map(e => [e.displayName || e.email, e]));

    const expandToNode = (emp: Employee) => {
      if (emp.reportsTo && emp.reportsTo !== "none") {
        const manager = employeeMap.get(emp.reportsTo);
        if (manager) {
          newExpanded.add(manager.displayName || manager.email);
          expandToNode(manager);
        }
      }
    };

    employees.forEach(emp => {
      if (emp.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) {
        expandToNode(emp);
      }
    });

    setExpandedNodes(newExpanded);
  }, [searchQuery, employees]);

  const TreeNode = ({ node, level = 0 }: { node: Employee, level?: number }) => {
    const isExpanded = expandedNodes.has(node.displayName || node.email) || searchQuery === "";
    const hasChildren = node.children && node.children.length > 0;
    const isSearchResult = searchQuery && node.displayName?.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div className="w-full">
        <div 
          className="flex items-center gap-3 p-2 rounded-lg group"
          style={{ marginLeft: `${level * 24}px` }}
        >
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground ${hasChildren ? '' : 'opacity-0 pointer-events-none'}`}
            onClick={() => { /* Manual toggle can be added here if needed */ }}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          <div className={`flex items-center gap-3 flex-1 p-2 rounded-md border bg-card shadow-sm transition-all ${isSearchResult ? 'ring-2 ring-primary shadow-lg' : 'group-hover:shadow-md'}`}>
            <Avatar className="h-8 w-8">
                <AvatarImage src={node.photoURL} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {node.displayName?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1">
                <span className="font-medium text-sm">{node.displayName || node.email}</span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full w-fit">
                {node.designation || node.role || "Employee"}
                </span>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Vertical guide line */}
            <div 
              className="absolute top-0 bottom-2 w-px bg-border" 
              style={{ left: `${level * 24 + 11}px` }} 
            />
            {node.children!.map(child => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Organization Chart
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualizing the reporting hierarchy
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for an employee..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-card p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading organization chart...</div>
          ) : tree.length > 0 ? (
            <div className="min-w-[300px] max-w-4xl">
               {tree.map(root => (
                 <TreeNode key={root.id} node={root} />
               ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No data available to build chart.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}