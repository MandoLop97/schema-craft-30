import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Preview from "./pages/Preview";
import Builder from "./pages/Builder";
import ExportSchema from "./pages/ExportSchema";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/builder" element={<Builder />} />
          <Route path="/admin/export" element={<ExportSchema />} />

          {/* Preview (draft) routes */}
          <Route path="/preview" element={<Preview />} />
          <Route path="/preview/:slug" element={<Preview />} />

          {/* Public (published) routes */}
          <Route path="/" element={<Index />} />
          <Route path="/:slug" element={<Index />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
