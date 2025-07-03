import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

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
  sharedMode?: boolean;
  userId?: string;
  progress?: any;
  onSaveProgress?: (progress: any) => Promise<void>;
}

export default function PlanManager({ pages, parts, chapters, bookId, plan: initialPlan, sharedMode = false, userId, progress, onSaveProgress }: PlanManagerProps) {
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
  const [progressMode, setProgressMode] = useState<'chapter' | 'page'>('chapter');
  const [completedChapters, setCompletedChapters] = useState(0);
  const [completedPages, setCompletedPages] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // plan이 바뀌면 입력값도 동기화
  useEffect(() => {
    if (initialPlan) setPlan(initialPlan);
  }, [initialPlan]);

  // 공유책 모드: 진도 상태를 Supabase progress prop에서 불러옴
  useEffect(() => {
    if (sharedMode && progress) {
      setCompletedChapters(progress.completed_chapters || 0);
      setCompletedPages(progress.completed_pages || 0);
      setProgressMode(progress.progress_mode || 'chapter');
      setIsCompleted(!!progress.is_completed);
    }
  }, [sharedMode, progress]);

  // 책 데이터에서 기존 진도/완료 상태 불러오기
  useEffect(() => {
    if (sharedMode) return;
    if (!bookId) return;
    const stored = window.localStorage.getItem('dashboardBooks');
    const books = stored ? JSON.parse(stored) : [];
    const idx = books.findIndex((b: any) => b.title === bookId);
    if (idx !== -1) {
      setCompletedChapters(books[idx].completedChapters || 0);
      setCompletedPages(books[idx].completedPages || 0);
      setProgressMode(books[idx].progressMode || 'chapter');
      setIsCompleted(!!books[idx].isCompleted);
    }
  }, [bookId, sharedMode]);

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

  // 진도 저장: 공유책이면 Supabase, 아니면 localStorage
  const saveProgress = async (newCompletedChapters: number, newCompletedPages: number, newProgressMode: 'chapter' | 'page') => {
    if (sharedMode && onSaveProgress) {
      await onSaveProgress({
        completed_chapters: newCompletedChapters,
        completed_pages: newCompletedPages,
        progress_mode: newProgressMode,
        is_completed: isCompleted,
      });
      return;
    }
    if (!bookId) return;
    const stored = window.localStorage.getItem('dashboardBooks');
    const books = stored ? JSON.parse(stored) : [];
    const idx = books.findIndex((b: any) => b.title === bookId);
    if (idx !== -1) {
      books[idx].completedChapters = newCompletedChapters;
      books[idx].completedPages = newCompletedPages;
      books[idx].progressMode = newProgressMode;
      window.localStorage.setItem('dashboardBooks', JSON.stringify(books));
      window.dispatchEvent(new CustomEvent('add-book', { detail: books[idx] }));
    }
  };

  const handleProgressModeChange = (mode: 'chapter' | 'page') => {
    setProgressMode(mode);
    saveProgress(
      mode === 'chapter' ? completedChapters : 0,
      mode === 'page' ? completedPages : 0,
      mode
    );
  };

  const handleCompletedChaptersChange = (val: string) => {
    const num = Math.max(0, Math.min(Number(val), totalChapters));
    setCompletedChapters(num);
    saveProgress(num, completedPages, progressMode);
  };
  const handleCompletedPagesChange = (val: string) => {
    const num = Math.max(0, Math.min(Number(val), pages));
    setCompletedPages(num);
    saveProgress(completedChapters, num, progressMode);
  };

  // 학습 완료 상태 저장
  const setBookCompleted = (completed: boolean) => {
    setIsCompleted(completed);
    if (sharedMode && onSaveProgress) {
      onSaveProgress({
        completed_chapters: completedChapters,
        completed_pages: completedPages,
        progress_mode: progressMode,
        is_completed: completed,
      });
      return;
    }
    if (!bookId) return;
    const stored = window.localStorage.getItem('dashboardBooks');
    const books = stored ? JSON.parse(stored) : [];
    const idx = books.findIndex((b: any) => b.title === bookId);
    if (idx !== -1) {
      books[idx].isCompleted = completed;
      window.localStorage.setItem('dashboardBooks', JSON.stringify(books));
      window.dispatchEvent(new CustomEvent('add-book', { detail: books[idx] }));
    }
  };

  // 본인만 입력/수정 가능, 타인은 읽기 전용 안내
  const isEditable = true;

  const renderReadOnly = () => (
    <>
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
          {isEditable && <Button className="mt-4" onClick={() => setEditMode(true)}>수정</Button>}
        </CardContent>
      </Card>
      <div className="mt-6">{renderProgressManager()}</div>
    </>
  );

  const renderProgressManager = () => (
    <Card>
      <CardHeader>
        <CardTitle>진도 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-center">
          <label>
            <input
              type="radio"
              checked={progressMode === 'chapter'}
              onChange={() => handleProgressModeChange('chapter')}
              className="mr-2"
            />
            챕터 기준
          </label>
          <label>
            <input
              type="radio"
              checked={progressMode === 'page'}
              onChange={() => handleProgressModeChange('page')}
              className="mr-2"
            />
            페이지 기준
          </label>
        </div>
        {progressMode === 'chapter' ? (
          <div className="flex items-center gap-2">
            <span>완료 챕터 수:</span>
            <Input
              type="number"
              min={0}
              max={totalChapters}
              value={completedChapters}
              onChange={e => handleCompletedChaptersChange(e.target.value)}
              className="w-24"
            />
            <span>/ {totalChapters}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>완료 페이지 수:</span>
            <Input
              type="number"
              min={0}
              max={pages}
              value={completedPages}
              onChange={e => handleCompletedPagesChange(e.target.value)}
              className="w-24"
            />
            <span>/ {pages}</span>
          </div>
        )}
        <div className="mt-2">
          <Progress value={progressMode === 'chapter' && totalChapters > 0 ? (completedChapters / totalChapters) * 100 : progressMode === 'page' && pages > 0 ? (completedPages / pages) * 100 : 0} />
          <div className="text-right text-xs mt-1">
            {progressMode === 'chapter' && totalChapters > 0
              ? `${((completedChapters / totalChapters) * 100).toFixed(1)}%`
              : progressMode === 'page' && pages > 0
              ? `${((completedPages / pages) * 100).toFixed(1)}%`
              : '0%'}
          </div>
        </div>
        <div className="mt-4">
          {isCompleted ? (
            <Button variant="outline" className="bg-green-100 text-green-700 cursor-default mr-2" disabled>학습 완료됨</Button>
          ) : (
            <Button variant="default" onClick={() => setBookCompleted(true)}>학습 완료로 표시</Button>
          )}
          {isCompleted && (
            <Button variant="destructive" onClick={() => setBookCompleted(false)}>완료 취소</Button>
          )}
        </div>
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