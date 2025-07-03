import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import BookCard from '@/components/BookCard';
import Navigation from '@/components/Navigation';

export default function BookCompletedList() {
  const [completedBooks, setCompletedBooks] = useState<any[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem('dashboardBooks');
    const books = stored ? JSON.parse(stored) : [];
    setCompletedBooks(books.filter((b: any) => b.isCompleted));
  }, []);

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">학습 완료한 책</h1>
          <Link to="/">
            <Button variant="outline">대시보드로 돌아가기</Button>
          </Link>
        </div>
        {completedBooks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            아직 학습 완료한 책이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedBooks.map((book, idx) => (
              <BookCard
                key={idx}
                {...book}
                showRecordsButton={true}
                recordsLink={`/completed-books/${encodeURIComponent(book.title)}/records`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
} 