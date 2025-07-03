import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '@/components/BookCard';
import Navigation from '@/components/Navigation';

export default function BookWishlistList() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = window.localStorage.getItem('wishlistBooks');
    setWishlist(stored ? JSON.parse(stored) : []);
  }, []);

  const handleRemove = (title: string) => {
    const updated = wishlist.filter((b: any) => b.title !== title);
    setWishlist(updated);
    window.localStorage.setItem('wishlistBooks', JSON.stringify(updated));
  };

  const handleRegister = (book: any) => {
    navigate(`/add-book/${encodeURIComponent(book.title)}`, { state: { book } });
  };

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">위시리스트</h1>
          <Link to="/search">
            <Button variant="outline">책 검색하기</Button>
          </Link>
        </div>
        {wishlist.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            위시리스트에 추가한 책이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishlist.map((book, idx) => (
              <Card key={idx} className="relative">
                <BookCard {...book} />
                <div className="flex gap-2 absolute top-4 right-4">
                  <Button size="sm" variant="default" onClick={() => handleRegister(book)}>
                    개인 책으로 등록
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleRemove(book.title)}>
                    삭제
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 