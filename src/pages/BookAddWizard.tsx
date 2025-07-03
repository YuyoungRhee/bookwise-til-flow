import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChapterSetSelector from '@/components/ChapterSetSelector';
import { useChapterSets, BookInfo } from '@/hooks/useChapterSets';
import { useAuth } from '@/contexts/AuthContext';

const JAVA_PARTS = [
  {
    name: 'PART 01. 자바 언어의 기초',
    chapters: [
      'Chapter 01. 자바 시작하기',
      'Chapter 02. 변수와 타입',
      'Chapter 03. 연산자',
      'Chapter 04. 조건문과 반복문',
    ]
  },
  {
    name: 'PART 02. 객체지향 프로그래밍',
    chapters: [
      'Chapter 05. 참조 타입',
      'Chapter 06. 클래스',
      'Chapter 07. 상속',
      'Chapter 08. 인터페이스',
      'Chapter 09. 중첩 선언과 익명 객체',
      'Chapter 10. 라이브러리와 모듈',
      'Chapter 11. 예외 처리',
    ]
  },
  {
    name: 'PART 03. 라이브러리 활용',
    chapters: [
      'Chapter 12. java.base 모듈',
      'Chapter 13. 제네릭',
      'Chapter 14. 멀티 스레드',
      'Chapter 15. 컬렉션 자료구조',
      'Chapter 16. 람다식',
      'Chapter 17. 스트림 요소 처리',
    ]
  },
  {
    name: 'PART 04. 데이터 입출력',
    chapters: [
      'Chapter 18. 데이터 입출력',
      'Chapter 19. 네트워크 입출력',
      'Chapter 20. 데이터베이스 입출력',
    ]
  },
  {
    name: 'PART 05. 최신 자바의 강화된 언어 기능',
    chapters: [
      'Chapter 21. 자바 21에서 강화된 언어 및 라이브러리',
    ]
  },
  {
    name: '부록 (Appendix)',
    chapters: [
      'Appendix 01. 데이터베이스 입출력 (MySQL용)',
      'Appendix 02. Java UI - Swing',
      'Appendix 03. Java UI - JavaFX',
      'Appendix 04. NIO 기반 입출력 및 네트워킹',
    ]
  },
];

export default function BookAddWizard() {
  const { title } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { findOrCreateBookInfo } = useChapterSets();
  
  const book = location.state?.book || {
    title: decodeURIComponent(title || ''),
    author: '',
    publisher: '',
    pubDate: '',
    cover: '/placeholder.svg',
    isbn: '',
    description: '',
  };
  
  const [step, setStep] = useState(1);
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [pages, setPages] = useState(1112);
  const [plan, setPlan] = useState({ targetDate: '', dailyChapters: '', dailyPages: '', expectedEnd: '', autoDaily: null as null | { chapters: number; pages: number } });
  const [inputMode, setInputMode] = useState<'date' | 'chapter' | 'page' | null>(null);

  useEffect(() => {
    // 1단계에서 book_info 생성
    if (step === 1) {
      initializeBookInfo();
    }
  }, []);

  const initializeBookInfo = async () => {
    const info = await findOrCreateBookInfo({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
    });
    setBookInfo(info);
  };

  // 1단계: 챕터 입력/확인
  const renderChapters = () => {
    if (!bookInfo) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>책 정보를 준비하고 있습니다...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>책 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>책 제목: <b>{book.title}</b></div>
            <div>총 페이지: <Input type="number" value={pages} onChange={e => setPages(Number(e.target.value))} className="w-32 inline-block ml-2" /> 쪽</div>
          </CardContent>
        </Card>
        
        <ChapterSetSelector
          bookInfo={bookInfo}
          onChapterSelected={setSelectedChapters}
          onNext={() => setStep(2)}
        />
      </div>
    );
  };

  // 2단계: 학습 계획 수립
  const totalChapters = selectedChapters.length;
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
        <Button className="mt-4" onClick={() => setStep(3)}>다음 (최종 등록)</Button>
      </CardContent>
    </Card>
  );

  // 3단계: 최종 등록
  const handleRegister = () => {
    // Dashboard에 추가 (localStorage + 이벤트)
    const stored = window.localStorage.getItem('dashboardBooks');
    const books = stored ? JSON.parse(stored) : [];
    const newBook = {
      ...book,
      pages,
      chapters: selectedChapters,
      plan,
      totalChapters,
      completedChapters: 0,
      progress: 0,
    };
    const updated = [...books, newBook];
    window.localStorage.setItem('dashboardBooks', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('add-book', { detail: newBook }));
    navigate('/');
  };
  const renderConfirm = () => (
    <Card>
      <CardHeader>
        <CardTitle>최종 등록</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>책 제목: <b>{book.title}</b></div>
        <div>총 페이지: <b>{pages}</b>쪽</div>
        <div>총 챕터: <b>{totalChapters}</b></div>
        <div>학습 계획: {plan.targetDate ? `목표일 ${plan.targetDate}` : ''} {plan.autoDaily ? `(하루 ${plan.autoDaily.chapters}챕터, ${plan.autoDaily.pages}쪽)` : ''} {plan.expectedEnd ? `(예상 완료일 ${plan.expectedEnd})` : ''}</div>
        <Button className="mt-4" onClick={handleRegister}>등록</Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">책 등록 플로우</h1>
      {step === 1 && renderChapters()}
      {step === 2 && renderPlan()}
      {step === 3 && renderConfirm()}
    </div>
  );
} 