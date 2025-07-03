import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SharedBooks from "./pages/SharedBooks";
import BookSearch from "./pages/BookSearch";
import BookList from "./pages/BookList";
import StudyPlanning from "./pages/StudyPlanning";
import NoteWritingNew from "./pages/NoteWritingNew";
import NoteHistory from "./pages/NoteHistory";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BookDetail from './pages/BookDetail';
import BookAddWizard from './pages/BookAddWizard';
import SharedBookAddWizard from './pages/SharedBookAddWizard';
import SharedBookDetail from './pages/SharedBookDetail';
import BookCompletedList from './pages/BookCompletedList';
import BookCompletedRecords from './pages/BookCompletedRecords';
import BookWishlistList from './pages/BookWishlistList';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">로딩 중...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <Routes>
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" replace />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/shared-books" element={<ProtectedRoute><SharedBooks /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><BookSearch /></ProtectedRoute>} />
      <Route path="/books" element={<ProtectedRoute><BookList /></ProtectedRoute>} />
      <Route path="/books/:bookId" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
      <Route path="/books/:bookId/planning" element={<ProtectedRoute><StudyPlanning /></ProtectedRoute>} />
      <Route path="/note-writing/:bookId" element={<ProtectedRoute><NoteWritingNew /></ProtectedRoute>} />
      <Route path="/note-history" element={<ProtectedRoute><NoteHistory /></ProtectedRoute>} />
      <Route path="/add-book/:title" element={<ProtectedRoute><BookAddWizard /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/shared-books/create" element={<ProtectedRoute><SharedBookAddWizard /></ProtectedRoute>} />
      <Route path="/shared-books/:bookId" element={<ProtectedRoute><SharedBookDetail /></ProtectedRoute>} />
      <Route path="/completed-books" element={<ProtectedRoute><BookCompletedList /></ProtectedRoute>} />
      <Route path="/completed-books/:bookId/records" element={<ProtectedRoute><BookCompletedRecords /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><BookWishlistList /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
