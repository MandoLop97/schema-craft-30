import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SchemaStore } from "@/lib/schema-store";
import Index from "./pages/Index";
import Preview from "./pages/Preview";
import ExportSchema from "./pages/ExportSchema";
import LicenseBlocked from "./pages/LicenseBlocked";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const status = SchemaStore.getLicenseStatus();
  if (status !== 'active') {
    return <Navigate to="/license-blocked" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/admin/export" element={<AdminRoute><ExportSchema /></AdminRoute>} />
          <Route path="/license-blocked" element={<LicenseBlocked />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
