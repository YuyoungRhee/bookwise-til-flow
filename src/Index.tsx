import BookDetail from './pages/BookDetail';
import BookCompletedList from './pages/BookCompletedList';
import { Routes, Route } from 'react-router-dom';
 
<Routes>
  {/* ...기존 라우트... */}
  <Route path="/books/:bookId" element={<BookDetail />} />
  <Route path="/completed-books" element={<BookCompletedList />} />
</Routes> 