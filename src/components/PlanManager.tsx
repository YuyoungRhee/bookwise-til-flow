import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Plan {
  chapter: string;
  targetDate: string;
}

interface PlanManagerProps {
  pages?: number;
  parts?: { name: string; chapters: string[] }[];
  chapters?: string[];
  bookId?: string;
  plan?: any;
}

export default function PlanManager({ pages, parts, chapters, bookId, plan: initialPlan }: PlanManagerProps) {
  const isJavaBook = bookId && decodeURIComponent(bookId).includes('이것이 자바다');
  const totalChapters = parts && parts.length > 0
    ? parts.reduce((sum, p) => sum + p.chapters.length, 0)
    : chapters && chapters.length > 0
      ? chapters.length
      : 0;
  const [plan, setPlan] = useState(() => initialPlan || { targetDate: '', dailyChapters: '', dailyPages: '', expectedEnd: '', autoDaily: null as null | { chapters: number; pages: number } });
  const [inputMode, setInputMode] = useState<'date' | 'chapter' | 'page' | null>(null);
  const [targetDate, setTargetDate] = useState('');
  const [dailyChapters, setDailyChapters] = useState('');
  const [dailyPages, setDailyPages] = useState('');
  const [expectedEnd, setExpectedEnd] = useState('');
  const [autoDaily, setAutoDaily] = useState<{ chapters: number; pages: number } | null>(null);
  const [editMode, setEditMode] = useState(false);

  // plan이 바뀌면 입력값도 동기화
  useEffect(() => {
    if (initialPlan) setPlan(initialPlan);
  }, [initialPlan]);

  // 저장 시 localStorage와 이벤트로 반영
  const handleSave = () => {
    // 책 찾기
    const stored = window.localStorage.getItem('dashboardBooks');
    const books = stored ? JSON.parse(stored) : [];
    const idx = books.findIndex((b: any) => b.title === bookId);
    if (idx !== -1) {
      books[idx].plan = plan;
      window.localStorage.setItem('dashboardBooks', JSON.stringify(books));
      window.dispatchEvent(new CustomEvent('add-book', { detail: books[idx] }));
    }
    setEditMode(false);
  };

  // 목표 완료일 → 하루 학습량 계산
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

  // 하루 학습량(챕터) 입력 시: 목표일 자동 계산, 페이지 입력란 비활성화
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

  // 하루 학습량(페이지) 입력 시: 목표일 자동 계산, 챕터 입력란 비활성화
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

  const renderReadOnly = () => (
    <Card>
      <CardHeader>
        <CardTitle>학습 계획</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>총 페이지: <b>{pages}</b>쪽 / 총 챕터: <b>{totalChapters}</b></div>
        <div>목표 완료일: <b>{plan.targetDate || '-'}</b></div>
        <div>하루 학습량(챕터): <b>{plan.dailyChapters || '-'}</b></div>
        <div>하루 학습량(페이지): <b>{plan.dailyPages || '-'}</b></div>
        <div>예상 완료일: <b>{plan.expectedEnd || plan.targetDate || '-'}</b></div>
        <Button className="mt-4" onClick={() => setEditMode(true)}>수정</Button>
      </CardContent>
    </Card>
  );

  const renderEdit = () => (
    <Card>
      <CardHeader>
        <CardTitle>학습 계획 수정</CardTitle>
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
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave}>저장</Button>
          <Button variant="outline" onClick={() => setEditMode(false)}>취소</Button>
        </div>
      </CardContent>
    </Card>
  );

  return editMode ? renderEdit() : renderReadOnly();
} 