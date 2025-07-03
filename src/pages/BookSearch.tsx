import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';

interface BookResult {
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  cover: string;
  isbn: string;
  description: string;
}

export default function BookSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualPublisher, setManualPublisher] = useState('');
  const [wishlist, setWishlist] = useState<any[]>(() => {
    const stored = window.localStorage.getItem('wishlistBooks');
    return stored ? JSON.parse(stored) : [];
  });
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    // 완전 mock 데이터로 대체
    setTimeout(() => {
      const mockResults: BookResult[] = [
        {
          title: '이것이 자바다',
          author: '신용권, 임영균',
          publisher: '한빛미디어',
          pubDate: '2023-01-01',
          cover: '/placeholder.svg',
          isbn: '9788968481901',
          description: '자바 입문부터 실전까지 완벽하게 배우는 책',
        },
        {
          title: '클린 코드',
          author: '로버트 C. 마틴',
          publisher: '인사이트',
          pubDate: '2013-12-24',
          cover: '/placeholder.svg',
          isbn: '9788966260959',
          description: '애자일 소프트웨어 장인 정신',
        },
        {
          title: '자바스크립트 완벽 가이드',
          author: '데이비드 플래너건',
          publisher: '한빛미디어',
          pubDate: '2022-06-01',
          cover: '/placeholder.svg',
          isbn: '9791162245927',
          description: '모던 자바스크립트의 모든 것',
        },
      ].filter(b => b.title.includes(searchQuery) || b.author.includes(searchQuery) || searchQuery === '');
      setSearchResults(mockResults);
      setIsLoading(false);
    }, 500);
  };

  const handleAddBook = (book: BookResult) => {
    navigate(`/add-book/${encodeURIComponent(book.title)}`, { state: { book } });
  };

  const handleAddWishlist = (book: BookResult) => {
    if (wishlist.some((b: any) => b.title === book.title)) return;
    const updated = [...wishlist, book];
    setWishlist(updated);
    window.localStorage.setItem('wishlistBooks', JSON.stringify(updated));
  };

  const handleManualSubmit = () => {
    if (!manualTitle.trim() || !manualAuthor.trim() || !manualPublisher.trim()) return;
    const book = {
      title: manualTitle,
      author: manualAuthor,
      publisher: manualPublisher,
      pubDate: '',
      cover: '/placeholder.svg',
      isbn: '',
      description: '',
    };
    navigate(`/add-book/${encodeURIComponent(manualTitle)}`, { state: { book } });
  };

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold study-text">책 검색</h1>
          <p className="text-muted-foreground">
            학습하고 싶은 책을 검색하여 추가하세요
          </p>
        </div>

        {/* Search Form */}
        <Card className="book-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              책 제목으로 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="예: 클린 코드, 자바스크립트..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? '검색 중...' : '검색'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 직접 입력하기 버튼/폼: 항상 노출, 테스트용 안내 위 */}
        <div className="text-center pt-4 space-y-4">
          <Button variant="outline" onClick={() => setShowManualForm(v => !v)}>
            직접 입력하기
          </Button>
          {showManualForm && (
            <div className="mt-4 space-y-2 max-w-xs mx-auto">
              <Input placeholder="제목" value={manualTitle} onChange={e => setManualTitle(e.target.value)} />
              <Input placeholder="저자" value={manualAuthor} onChange={e => setManualAuthor(e.target.value)} />
              <Input placeholder="출판사" value={manualPublisher} onChange={e => setManualPublisher(e.target.value)} />
              <Button className="w-full mt-2" onClick={handleManualSubmit}>
                다음
              </Button>
            </div>
          )}
        </div>

        {/* Search Results */}
        {hasSearched && (
          <Card className="book-shadow">
            <CardHeader>
              <CardTitle>검색 결과</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">검색 중입니다...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((book, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex gap-4">
                        <img 
                          src={book.cover} 
                          alt={book.title}
                          className="w-20 h-28 object-cover rounded border book-shadow"
                        />
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold study-text">{book.title}</h3>
                            <p className="text-muted-foreground">{book.author}</p>
                          </div>
                          <div className="flex gap-2 text-sm">
                            <Badge variant="outline">{book.publisher}</Badge>
                            <Badge variant="outline">{book.pubDate}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {book.description}
                          </p>
                        </div>
                        <div className="flex flex-col justify-between gap-2">
                          <Button onClick={() => handleAddBook(book)}>
                            <Book className="w-4 h-4 mr-2" />
                            추가
                          </Button>
                          <Button 
                            variant={wishlist.some((b: any) => b.title === book.title) ? 'outline' : 'default'}
                            disabled={wishlist.some((b: any) => b.title === book.title)}
                            onClick={() => handleAddWishlist(book)}
                          >
                            {wishlist.some((b: any) => b.title === book.title) ? '위시리스트에 있음' : '위시리스트에 추가'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <p className="text-muted-foreground">검색 결과가 없습니다</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    다른 키워드로 검색해보세요
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Data Notice */}
        <Card className="book-shadow border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  테스트용 책 데이터 안내
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  이것이 자바다, 클린 코드, 자바스크립트 완벽 가이드
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}