import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Salary from "./pages/Salary";
import Increment from "./pages/Increment";
import Documents from "./pages/Documents";
import Directory from "./pages/Directory";
import OrgChart from "./pages/OrgChart";
import Profile from "./pages/Profile";
import Performance from "./pages/Performance";
import Resignation from "./pages/Resignation";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminLeave from "./pages/admin/AdminLeave";
import AdminPayroll from "./pages/admin/AdminPayroll";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminIncrements from "./pages/admin/AdminIncrements";
import AdminPerformance from "./pages/admin/AdminPerformance";
import AdminResignations from "./pages/admin/AdminResignations";
import AdminOrganization from "./pages/admin/AdminOrganization";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/salary" element={<Salary />} />
            <Route path="/increment" element={<Increment />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/org-chart" element={<OrgChart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/resignation" element={<Resignation />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/leave" element={<AdminLeave />} />
            <Route path="/admin/payroll" element={<AdminPayroll />} />
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/admin/increments" element={<AdminIncrements />} />
            <Route path="/admin/performance" element={<AdminPerformance />} />
            <Route path="/admin/resignations" element={<AdminResignations />} />
            <Route path="/admin/organization" element={<AdminOrganization />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;