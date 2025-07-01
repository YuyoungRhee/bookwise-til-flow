import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Book } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function BookList() {
  const [books, setBooks] = useState(() => {
    const stored = window.localStorage.getItem('dashboardBooks');
    return stored ? JSON.parse(stored) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      const stored = window.localStorage.getItem('dashboardBooks');
      setBooks(stored ? JSON.parse(stored) : []);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const filteredBooks = books.filter((book: any) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookClick = (book: any) => {
    navigate(`/books/${encodeURIComponent(book.title)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold study-text">책 목록</h1>
            <p className="text-muted-foreground mt-2">등록된 책을 관리하고 새로운 책을 추가하세요</p>
          </div>
          <Button onClick={() => navigate('/search')} className="gap-2">
            <Plus className="w-4 h-4" />
            새 책 추가
          </Button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="책 제목이나 저자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline" className="text-sm">
            총 {books.length}권
          </Badge>
        </div>

        {filteredBooks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Book className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {books.length === 0 ? '등록된 책이 없습니다' : '검색 결과가 없습니다'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {books.length === 0 
                  ? '새로운 책을 추가하여 학습을 시작해보세요'
                  : '다른 검색어를 시도해보세요'
                }
              </p>
              {books.length === 0 && (
                <Button onClick={() => navigate('/search')}>
                  첫 번째 책 추가하기
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book: any, index: number) => (
              <Card 
                key={index} 
                className="book-shadow hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleBookClick(book)}
              >
                <CardHeader className="pb-3">
                  <div className="flex gap-4">
                    {book.cover ? (
                      <img 
                        src={book.cover} 
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded border book-shadow"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-muted rounded border flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">No Cover</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors study-text line-clamp-2">
                        {book.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">진행률</span>
                      <Badge variant="outline" className="text-xs">
                        {book.completedChapters || 0}/{book.totalChapters || 0} 챕터
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={book.progress || 0} className="progress-fill" />
                      <p className="text-xs text-muted-foreground text-right">
                        {Math.round(book.progress || 0)}% 완료
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}