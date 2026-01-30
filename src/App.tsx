import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import UsersManagement from "./pages/UsersManagement";
import PlacesAdmin from "./pages/PlacesAdmin";
import AdminMapPage from "./pages/AdminMapPage";
import SystemConfig from "./pages/SystemConfig";
import SecurityLogs from "./pages/SecurityLogs";
import ChatLogs from "./pages/ChatLogs";
import ChatFeedback from "./pages/ChatFeedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
            <Route path="/places-admin" element={<ProtectedRoute><PlacesAdmin /></ProtectedRoute>} />
            <Route path="/admin/map-editor" element={<ProtectedRoute><AdminMapPage /></ProtectedRoute>} />
            <Route path="/config" element={<ProtectedRoute><SystemConfig /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><SecurityLogs /></ProtectedRoute>} />
            <Route path="/chats" element={<ProtectedRoute><ChatLogs /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><ChatFeedback /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
