import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

interface RecordManagerProps {
  initialChapter?: number;
  bookTitle?: string;
  chapters?: string[];
}

export default function RecordManager({ initialChapter, bookTitle, chapters: chaptersProp }: RecordManagerProps) {
  const chapters = chaptersProp && chaptersProp.length > 0 ? chaptersProp : [
    'CHAPTER 01 리팩터링: 첫 번째 예시',
    'CHAPTER 02 리팩터링 원칙',
    'CHAPTER 03 코드에서 나는 악취',
    'CHAPTER 04 테스트 구축하기',
    'CHAPTER 05 리팩터링 카탈로그 보는 법',
    'CHAPTER 06 기본적인 리팩터링',
    'CHAPTER 07 캡슐화',
    'CHAPTER 08 기능 이동',
    'CHAPTER 09 데이터 조직화',
    'CHAPTER 10 조건부 로직 간소화',
    'CHAPTER 11 API 리팩터링',
    'CHAPTER 12 상속 다루기',
  ];
  const [currentChapter, setCurrentChapter] = useState(initialChapter !== undefined ? initialChapter : 2);
  const [records, setRecords] = useState<Record<number, { content: string; date: string }>>({});
  const navigate = useNavigate();

  // initialChapter가 변경되면 currentChapter 업데이트
  useEffect(() => {
    if (initialChapter !== undefined) {
      setCurrentChapter(initialChapter);
    }
  }, [initialChapter]);

  useEffect(() => {
    // localStorage에서 chapterNotes를 읽어와서, 현재 책의 기록만 추출
    const notes = JSON.parse(window.localStorage.getItem('chapterNotes') || '[]');
    const filtered: Record<number, { content: string; date: string }> = {};
    notes.forEach((note: any) => {
      if (note.bookTitle === bookTitle) {
        filtered[Number(note.chapterIndex)] = {
          content: note.content,
          date: note.updatedAt ? note.updatedAt.slice(0, 10) : '-'
        };
      }
    });
    // 리팩터링 2판 예시 데이터 (1,2장)
    if (bookTitle === '리팩터링 2판') {
      if (!filtered[0]) {
        filtered[0] = {
          content: '<p>1장 기록 예시: 리팩터링의 실제 적용을 봄.</p>',
          date: '2024-07-01'
        };
      }
      if (!filtered[1]) {
        filtered[1] = {
          content: '<p>2장 기록 예시: 원칙을 이해함.</p>',
          date: '2024-07-02'
        };
      }
    }
    setRecords(filtered);
  }, [bookTitle]);

  const goPrev = () => {
    setCurrentChapter((idx) => Math.max(0, idx - 1));
  };
  const goNext = () => {
    setCurrentChapter((idx) => Math.min(chapters.length - 1, idx + 1));
  };

  const record = records[currentChapter];
  const hasRecord = !!record;

  const handleWriteRecord = () => {
    if (bookTitle) {
      navigate(`/note-writing/${encodeURIComponent(bookTitle)}?chapter=${currentChapter}`);
    } else {
      // fallback: 현재 URL에서 bookId 추출
      const pathParts = window.location.pathname.split('/');
      const bookId = pathParts[pathParts.length - 1];
      if (bookId) {
        navigate(`/note-writing/${bookId}?chapter=${currentChapter}`);
      }
    }
  };

  const handleEditRecord = () => {
    if (bookTitle) {
      navigate(`/note-writing/${encodeURIComponent(bookTitle)}?chapter=${currentChapter}`);
    } else {
      // fallback: 현재 URL에서 bookId 추출
      const pathParts = window.location.pathname.split('/');
      const bookId = pathParts[pathParts.length - 1];
      if (bookId) {
        navigate(`/note-writing/${bookId}?chapter=${currentChapter}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>챕터별 학습 기록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Button onClick={goPrev} disabled={currentChapter === 0} size="sm">이전</Button>
            <span className="font-bold text-lg">{chapters[currentChapter]}</span>
            <Button onClick={goNext} disabled={currentChapter === chapters.length - 1} size="sm">다음</Button>
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {hasRecord ? (
              <Button onClick={handleEditRecord} variant="outline">
                수정하기
              </Button>
            ) : (
              <Button onClick={handleWriteRecord}>
                기록하기
              </Button>
            )}
          </div>

          {/* 기록 내용 표시 */}
          <div>
            {hasRecord ? (
              <div>
                <div className="mb-2 text-muted-foreground text-sm">기록일: {record.date}</div>
                <div
                  className="w-full min-h-[200px] p-3 border rounded bg-background"
                  style={{ whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ __html: record.content }}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                해당 챕터 기록이 존재하지 않습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>전체 기록 히스토리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {chapters.map((ch, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 border-b py-2 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setCurrentChapter(idx)}
            >
              <span className="w-56">{ch}</span>
              <span className="w-32">{records[idx]?.date || '-'}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 