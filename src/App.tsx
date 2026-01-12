import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminLeave from "./pages/admin/AdminLeave";
import AdminPayroll from "./pages/admin/AdminPayroll";
import AdminIncrements from "./pages/admin/AdminIncrements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/salary" element={<Salary />} />
            <Route path="/increment" element={<Increment />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/leave" element={<AdminLeave />} />
            <Route path="/admin/payroll" element={<AdminPayroll />} />
            <Route path="/admin/increments" element={<AdminIncrements />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
