import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'react-router-dom';

interface Chapter {
  id: number;
  title: string;
  isCompleted: boolean;
  isPart: boolean;
}

interface ChapterManagerProps {
  parts?: { name: string; chapters: string[] }[];
  chapters?: string[];
  bookId?: string;
  setChapters?: (chapters: string[]) => void;
}

export default function ChapterManager({ parts, chapters, bookId, setChapters: setChaptersProp }: ChapterManagerProps) {
  const { bookId: urlBookId } = useParams();
  const bookIdDecoded = decodeURIComponent(urlBookId || '');
  const isRefactoring2 = bookIdDecoded.includes('리팩터링') && bookIdDecoded.includes('2판');
  const isJavaBook = bookId && decodeURIComponent(bookId).includes('이것이 자바다');
  const [chaptersState, setChapters] = useState<Chapter[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (parts && parts.length > 0) {
      setChapters(
        parts.flatMap((part, idx) => [
          { id: 1000 + idx, title: part.name, isCompleted: false, isPart: true },
          ...part.chapters.map((c, i) => ({
            id: (1000 + idx) * 100 + i,
            title: c,
            isCompleted: false,
            isPart: false,
          })),
        ])
      );
    } else if (chapters && chapters.length > 0) {
      setChapters(
        chapters.map((c, i) => ({
          id: 1000 + i,
          title: c,
          isCompleted: false,
          isPart: false,
        }))
      );
    } else {
      setChapters([]);
    }
  }, [parts, chapters]);

  const addChapter = () => {
    if (!newTitle.trim()) return;
    const newChapters = [...chaptersState, { id: Date.now(), title: newTitle, isCompleted: false, isPart: false }];
    setChapters(newChapters);
    setNewTitle('');
    if (setChaptersProp) setChaptersProp(newChapters.filter(ch => !ch.isPart).map(ch => ch.title));
  };
  const startEdit = (id: number, title: string) => {
    setEditId(id);
    setEditTitle(title);
  };
  const saveEdit = (id: number) => {
    const newChapters = chaptersState.map(ch => ch.id === id ? { ...ch, title: editTitle } : ch);
    setChapters(newChapters);
    setEditId(null);
    setEditTitle('');
    if (setChaptersProp) setChaptersProp(newChapters.filter(ch => !ch.isPart).map(ch => ch.title));
  };
  const deleteChapter = (id: number) => {
    const newChapters = chaptersState.filter(ch => ch.id !== id);
    setChapters(newChapters);
    if (setChaptersProp) setChaptersProp(newChapters.filter(ch => !ch.isPart).map(ch => ch.title));
  };
  const toggleComplete = (id: number) => {
    setChapters(chaptersState.map(ch => ch.id === id ? { ...ch, isCompleted: !ch.isCompleted } : ch));
  };

  return (
    <div className="space-y-4">
      {chaptersState.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">챕터 정보가 없습니다. 책 등록 시 챕터/파트 정보를 입력해 주세요.</div>
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              placeholder="새 챕터 제목"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addChapter()}
            />
            <Button onClick={addChapter}>추가</Button>
          </div>
          <div className="space-y-2">
            {chaptersState.map(ch => (
              <div key={ch.id} className="flex items-center gap-2">
                <Card className={`flex items-center px-4 py-2 flex-1 ${ch.isPart ? 'bg-muted font-bold' : ''}`}
                  style={{ minWidth: 0 }}>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ch.isPart ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary'}`}>{ch.isPart ? 'PART' : 'Chapter'}</span>
                  <div className="flex-1 min-w-0 ml-4">
                    <span className={ch.isCompleted ? 'line-through text-muted-foreground' : ''}>{ch.title}</span>
                  </div>
                  <div className="flex gap-1 min-w-[120px] ml-4">
                    {!ch.isPart && (
                      editId === ch.id ? (
                        <>
                          <Input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-40"
                          />
                          <Button size="sm" onClick={() => saveEdit(ch.id)}>저장</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditId(null)}>취소</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(ch.id, ch.title)}>수정</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteChapter(ch.id)}>삭제</Button>
                        </>
                      )
                    )}
                  </div>
                </Card>
                <div className="flex items-center min-w-[90px] justify-end">
                  {ch.isPart ? (
                    <Button size="sm" className="text-xs px-2 py-1 h-7" variant="outline" onClick={() => {
                      // PART를 챕터로
                      const newChapters = chaptersState.map(item =>
                        item.id === ch.id ? { ...item, isPart: false } : item
                      );
                      setChapters(newChapters);
                    }}>챕터로</Button>
                  ) : (
                    <Button size="sm" className="text-xs px-2 py-1 h-7" variant="outline" onClick={() => {
                      // 챕터를 PART로
                      const newChapters = chaptersState.map(item =>
                        item.id === ch.id ? { ...item, isPart: true } : item
                      );
                      setChapters(newChapters);
                    }}>PART로</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 