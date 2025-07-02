import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BookSearch from "./pages/BookSearch";
import BookList from "./pages/BookList";
import StudyPlanning from "./pages/StudyPlanning";
import NoteWritingNew from "./pages/NoteWritingNew";
import NoteHistory from "./pages/NoteHistory";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BookDetail from './pages/BookDetail';
import BookAddWizard from './pages/BookAddWizard';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<BookSearch />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/:bookId" element={<BookDetail />} />
          <Route path="/books/:bookId/planning" element={<StudyPlanning />} />
          <Route path="/note-writing/:bookId" element={<NoteWritingNew />} />
          <Route path="/note-history" element={<NoteHistory />} />
          <Route path="/add-book/:title" element={<BookAddWizard />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
