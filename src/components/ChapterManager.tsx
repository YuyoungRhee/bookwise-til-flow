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
}

export default function ChapterManager({ parts, chapters, bookId }: ChapterManagerProps) {
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
    setChapters([...chaptersState, { id: Date.now(), title: newTitle, isCompleted: false, isPart: false }]);
    setNewTitle('');
  };
  const startEdit = (id: number, title: string) => {
    setEditId(id);
    setEditTitle(title);
  };
  const saveEdit = (id: number) => {
    setChapters(chaptersState.map(ch => ch.id === id ? { ...ch, title: editTitle } : ch));
    setEditId(null);
    setEditTitle('');
  };
  const deleteChapter = (id: number) => {
    setChapters(chaptersState.filter(ch => ch.id !== id));
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
              <Card key={ch.id} className={`flex items-center p-2 gap-2 ${ch.isPart ? 'bg-muted font-bold' : ''}`}>
                <Badge
                  variant={ch.isCompleted ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => !ch.isPart && toggleComplete(ch.id)}
                >
                  {ch.isCompleted ? '완료' : ch.isPart ? 'PART' : '진행중'}
                </Badge>
                <span className={ch.isCompleted ? 'line-through text-muted-foreground' : ''}>{ch.title}</span>
                {!ch.isPart && (
                  <>
                    {editId === ch.id ? (
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
                    )}
                  </>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 