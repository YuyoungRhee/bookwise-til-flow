import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ChapterManager from '@/components/ChapterManager';
import PlanManager from '@/components/PlanManager';
import { Button } from '@/components/ui/button';
import RecordManager from '@/components/RecordManager';
import Navigation from '@/components/Navigation';

export default function BookDetail() {
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const chapterParam = searchParams.get('chapter');
  const tabValue = tabParam === 'record' ? 'records' : (tabParam || 'chapters');
  const initialChapter = chapterParam ? Number(chapterParam) : undefined;
  const [books, setBooks] = useState(() => {
    const stored = window.localStorage.getItem('dashboardBooks');
    return stored ? JSON.parse(stored) : [];
  });
  const navigate = useNavigate();
  const [currentBook, setCurrentBook] = useState<any>(null);
  const [chapters, setChapters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(tabValue);

  useEffect(() => {
    const handler = () => {
      const stored = window.localStorage.getItem('dashboardBooks');
      setBooks(stored ? JSON.parse(stored) : []);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    const found = books.find((b: any) => decodeURIComponent(bookId || '') === b.title);
    setCurrentBook(found);
    setChapters(found?.chapters || []);
  }, [books, bookId]);

  useEffect(() => {
    setActiveTab(tabValue);
  }, [tabValue]);

  const handleDelete = () => {
    if (!currentBook) return;
    const stored = window.localStorage.getItem('dashboardBooks');
    const books = stored ? JSON.parse(stored) : [];
    const updated = books.filter((b: any) => b.title !== currentBook.title);
    window.localStorage.setItem('dashboardBooks', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('add-book', { detail: { deleted: true, title: currentBook.title } }));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Card className="mb-0">
            <CardHeader>
              <CardTitle>책 상세 - {currentBook?.title || bookId}</CardTitle>
            </CardHeader>
          </Card>
          <Button variant="destructive" onClick={handleDelete}>책 삭제</Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="chapters">챕터 관리</TabsTrigger>
            <TabsTrigger value="plan">학습 계획 / 진도 관리</TabsTrigger>
            <TabsTrigger value="records">기록/히스토리</TabsTrigger>
          </TabsList>
          <TabsContent value="chapters">
            <ChapterManager parts={currentBook?.parts} chapters={chapters} bookId={bookId} setChapters={setChapters} />
          </TabsContent>
          <TabsContent value="plan">
            <PlanManager pages={currentBook?.pages} parts={currentBook?.parts} chapters={chapters} bookId={bookId} plan={currentBook?.plan} />
          </TabsContent>
          <TabsContent value="records">
            <RecordManager 
              initialChapter={initialChapter}
              bookTitle={currentBook?.title}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 