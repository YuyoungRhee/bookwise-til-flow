import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Book, Users, Plus, Link as LinkIcon, Copy } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface SharedBook {
  id: string;
  title: string;
  author: string;
  total_chapters: number;
  invite_code: string;
  created_at: string;
  member_count?: number;
}

export default function SharedBooks() {
  const [books, setBooks] = useState<SharedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSharedBooks();
  }, [user]);

  const fetchSharedBooks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('shared_books')
      .select(`
        *,
        book_members!inner(user_id)
      `)
      .eq('book_members.user_id', user.id);

    if (error) {
      console.error('Error fetching shared books:', error);
      toast({
        title: "오류",
        description: "공유 책 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  };

  const joinBook = async (code: string) => {
    if (!user) return;
    setJoinLoading(true);

    try {
      // Find book by invite code
      const { data: book, error: bookError } = await supabase
        .from('shared_books')
        .select('id')
        .eq('invite_code', code)
        .single();

      if (bookError || !book) {
        toast({
          title: "초대 코드 오류",
          description: "유효하지 않은 초대 코드입니다.",
          variant: "destructive"
        });
        return;
      }

      // Join the book
      const { error: joinError } = await supabase
        .from('book_members')
        .insert([{
          book_id: book.id,
          user_id: user.id
        }]);

      if (joinError) {
        if (joinError.code === '23505') { // unique constraint violation
          toast({
            title: "이미 참여 중",
            description: "이미 이 책에 참여하고 있습니다.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "참여 실패",
            description: "책 참여에 실패했습니다.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "참여 완료",
          description: "책에 성공적으로 참여했습니다!"
        });
        setInviteCode('');
        fetchSharedBooks();
      }
    } catch (error) {
      console.error('Error joining book:', error);
      toast({
        title: "오류",
        description: "책 참여 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "링크 복사됨",
      description: "초대 링크가 클립보드에 복사되었습니다."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-8">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">공유 책 목록</h1>
            <p className="text-muted-foreground">함께 학습하는 책들을 관리하세요</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  책 참여하기
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>초대 코드로 책 참여하기</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-code">초대 코드</Label>
                    <Input
                      id="invite-code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="8자리 초대 코드를 입력하세요"
                    />
                  </div>
                  <Button 
                    onClick={() => joinBook(inviteCode)}
                    disabled={!inviteCode.trim() || joinLoading}
                    className="w-full"
                  >
                    {joinLoading ? "참여 중..." : "참여하기"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Link to="/books/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                새 공유 책 만들기
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Book className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">아직 참여한 공유 책이 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                새로운 책을 만들거나 초대 코드로 기존 책에 참여해보세요
              </p>
            </div>
          ) : (
            books.map((book) => (
              <Card key={book.id} className="book-shadow hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{book.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyInviteLink(book.invite_code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Book className="w-4 h-4" />
                      {book.total_chapters}개 챕터
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {book.member_count || 0}명 참여
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      초대 코드: {book.invite_code}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link to={`/shared-books/${book.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        학습하기
                      </Button>
                    </Link>
                    <Link to={`/shared-books/${book.id}/notes`} className="flex-1">
                      <Button className="w-full">
                        기록 보기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}