import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Book } from 'lucide-react';

// BookSearch와 유사한 mock 데이터/검색 로직 (실제 구현시 API 연동)
const MOCK_BOOKS = [
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
];

export default function SharedBookAddWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [pages, setPages] = useState(0);
  const [plan, setPlan] = useState({ targetDate: '', dailyChapters: '', dailyPages: '', expectedEnd: '', autoDaily: null as null | { chapters: number; pages: number } });
  const [inputMode, setInputMode] = useState<'date' | 'chapter' | 'page' | null>(null);
  const [inviteMembers, setInviteMembers] = useState<string>('');

  // 1단계: 책 검색
  const handleSearch = () => {
    setSearchResults(
      MOCK_BOOKS.filter(b => b.title.includes(searchQuery) || b.author.includes(searchQuery) || searchQuery === '')
    );
  };
  const handleSelectBook = (book: any) => {
    setSelectedBook(book);
    setPages(300); // 예시
    setParts([{ name: 'PART 1', chapters: ['Chapter 1', 'Chapter 2'] }]); // 예시
    setStep(2);
  };

  // 2단계: 챕터 입력/확인 (BookAddWizard 참고)
  const renderChapters = () => (
    <Card>
      <CardHeader>
        <CardTitle>챕터 입력/확인</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>책 제목: <b>{selectedBook.title}</b></div>
        <div>총 페이지: <Input type="number" value={pages} onChange={e => setPages(Number(e.target.value))} className="w-32 inline-block ml-2" /> 쪽</div>
        <div className="space-y-2 mt-2">
          {parts.map((part, i) => (
            <div key={i} className="mb-2">
              <b>{part.name}</b>
              <ul className="ml-4 list-disc">
                {part.chapters.map((ch: string, j: number) => (
                  <li key={j}>{ch}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={() => setStep(3)}>다음 (학습 계획 수립)</Button>
      </CardContent>
    </Card>
  );

  // 3단계: 학습 계획 수립 (BookAddWizard 참고)
  const totalChapters = parts.reduce((sum, p) => sum + p.chapters.length, 0);
  const handleTargetDate = (date: string) => {
    setInputMode('date');
    setPlan(p => {
      const today = new Date();
      const end = new Date(date);
      const days = Math.max(1, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        ...p,
        targetDate: date,
        autoDaily: {
          chapters: Math.ceil(totalChapters / days),
          pages: Math.ceil(pages / days),
        },
        expectedEnd: '',
        dailyChapters: '',
        dailyPages: '',
      };
    });
  };
  const handleDailyChapters = (val: string) => {
    setInputMode('chapter');
    setPlan(p => {
      let days = 0;
      if (val) days = Math.ceil(totalChapters / Number(val));
      let expectedEnd = '';
      if (days > 0) {
        const today = new Date();
        today.setDate(today.getDate() + days);
        expectedEnd = today.toISOString().slice(0, 10);
      }
      return {
        ...p,
        dailyChapters: val,
        dailyPages: '',
        expectedEnd,
        targetDate: expectedEnd,
        autoDaily: null,
      };
    });
  };
  const handleDailyPages = (val: string) => {
    setInputMode('page');
    setPlan(p => {
      let days = 0;
      if (val) days = Math.ceil(pages / Number(val));
      let expectedEnd = '';
      if (days > 0) {
        const today = new Date();
        today.setDate(today.getDate() + days);
        expectedEnd = today.toISOString().slice(0, 10);
      }
      return {
        ...p,
        dailyPages: val,
        dailyChapters: '',
        expectedEnd,
        targetDate: expectedEnd,
        autoDaily: null,
      };
    });
  };
  const renderPlan = () => (
    <Card>
      <CardHeader>
        <CardTitle>학습 계획 수립</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>총 페이지: <b>{pages}</b>쪽 / 총 챕터: <b>{totalChapters}</b></div>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block mb-1">목표 완료일</label>
            <Input type="date" value={plan.targetDate} onChange={e => handleTargetDate(e.target.value)} disabled={inputMode === 'chapter' || inputMode === 'page'} />
            {plan.autoDaily && (
              <div className="text-xs mt-1">→ 하루 {plan.autoDaily.chapters}챕터, {plan.autoDaily.pages}쪽 학습 필요</div>
            )}
          </div>
          <div className="text-muted-foreground">또는</div>
          <div>
            <label className="block mb-1">하루 학습량</label>
            <Input type="number" min={1} placeholder="챕터 수" value={plan.dailyChapters} onChange={e => handleDailyChapters(e.target.value)} disabled={inputMode === 'date' || inputMode === 'page'} style={inputMode === 'date' || inputMode === 'page' ? { background: '#f3f4f6', color: '#aaa' } : {}} className="mb-1" />
            <Input type="number" min={1} placeholder="페이지 수" value={plan.dailyPages} onChange={e => handleDailyPages(e.target.value)} disabled={inputMode === 'date' || inputMode === 'chapter'} style={inputMode === 'date' || inputMode === 'chapter' ? { background: '#f3f4f6', color: '#aaa' } : {}} className="mb-1" />
            {plan.expectedEnd && (
              <div className="text-xs mt-1">→ {plan.expectedEnd}에 완료 예상</div>
            )}
          </div>
        </div>
        <Button className="mt-4" onClick={() => setStep(4)}>다음 (멤버 초대)</Button>
      </CardContent>
    </Card>
  );

  // 4단계: 멤버 초대 (선택)
  const renderInvite = () => (
    <Card>
      <CardHeader>
        <CardTitle>멤버 초대 (선택)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>초대할 멤버 이메일(쉼표로 구분):</div>
        <Input value={inviteMembers} onChange={e => setInviteMembers(e.target.value)} placeholder="예: a@a.com, b@b.com" />
        <Button className="mt-4" onClick={() => setStep(5)}>다음 (완성)</Button>
      </CardContent>
    </Card>
  );

  // 5단계: 공유책 생성 완료
  const handleRegister = async () => {
    if (!user) {
      toast({ 
        title: '오류', 
        description: '로그인이 필요합니다.', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      console.log('Creating shared book for user:', user.id);
      
      // 1. 공유책 생성
      const { data: book, error: bookError } = await supabase
        .from('shared_books')
        .insert([{
          title: selectedBook.title,
          author: selectedBook.author,
          total_chapters: totalChapters,
          pages: pages,
          chapters: parts.flatMap(part => part.chapters),
          parts: parts,
          created_by: user.id
        }])
        .select()
        .single();

      console.log('Book creation result:', { book, bookError });

      if (bookError) {
        console.error('Error creating shared book:', bookError);
        toast({ 
          title: '오류', 
          description: '공유책 생성에 실패했습니다.', 
          variant: 'destructive' 
        });
        return;
      }

      // 2. 생성자를 멤버로 추가 (간단한 방식)
      try {
        const { error: memberError } = await supabase
          .from('book_members')
          .insert([{
            book_id: book.id,
            user_id: user.id
          }]);

        console.log('Member addition result:', { memberError });

        if (memberError) {
          console.error('Error adding creator as member:', memberError);
          // 멤버 추가 실패해도 책은 생성되었으므로 계속 진행
          toast({ 
            title: '경고', 
            description: '책은 생성되었지만 멤버 추가에 실패했습니다.', 
            variant: 'destructive' 
          });
        }
      } catch (memberError) {
        console.error('Exception adding member:', memberError);
        // 멤버 추가 실패해도 책은 생성되었으므로 계속 진행
      }

      // 3. 성공 메시지
      toast({ 
        title: '공유책 생성 완료', 
        description: `${selectedBook.title} 공유책이 생성되었습니다! 초대 코드: ${book.invite_code}` 
      });
      
      // 4. 공유책 목록으로 이동
      navigate('/shared-books');
    } catch (error) {
      console.error('Error in handleRegister:', error);
      toast({ 
        title: '오류', 
        description: '공유책 생성 중 오류가 발생했습니다.', 
        variant: 'destructive' 
      });
    }
  };
  const renderComplete = () => (
    <Card>
      <CardHeader>
        <CardTitle>공유책 생성 완료</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>책 제목: <b>{selectedBook.title}</b></div>
        <div>멤버 초대: {inviteMembers || '없음'}</div>
        <Button className="mt-4" onClick={handleRegister}>공유책 목록으로 이동</Button>
      </CardContent>
    </Card>
  );

  // 렌더링 분기
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">공유책 만들기</h1>
        <Card>
          <CardHeader>
            <CardTitle>책 검색</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="책 제목, 저자 등으로 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>검색</Button>
            <div className="space-y-2">
              {searchResults.map((book, idx) => (
                <Card key={idx} className="p-3 cursor-pointer hover:bg-muted" onClick={() => handleSelectBook(book)}>
                  <div className="flex gap-4 items-center">
                    <img src={book.cover} alt={book.title} className="w-16 h-24 object-cover rounded border" />
                    <div className="flex-1">
                      <div className="font-bold">{book.title}</div>
                      <div className="text-sm text-muted-foreground">{book.author}</div>
                      <div className="text-xs text-muted-foreground">{book.publisher} / {book.pubDate}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{book.description}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (step === 2) return <div className="max-w-2xl mx-auto p-6">{renderChapters()}</div>;
  if (step === 3) return <div className="max-w-2xl mx-auto p-6">{renderPlan()}</div>;
  if (step === 4) return <div className="max-w-2xl mx-auto p-6">{renderInvite()}</div>;
  if (step === 5) return <div className="max-w-2xl mx-auto p-6">{renderComplete()}</div>;
  return null;
} 