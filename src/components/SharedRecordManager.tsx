import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

// 리팩터링 2판 대표 챕터 mock
const chapters = [
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

interface SharedNote {
  id: string;
  chapter_number: number;
  chapter_title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  author_name?: string;
  author_email?: string;
}

interface SharedRecordManagerProps {
  initialChapter?: number;
  bookId: string;
  bookTitle: string;
}

export default function SharedRecordManager({ initialChapter, bookId, bookTitle }: SharedRecordManagerProps) {
  const [currentChapter, setCurrentChapter] = useState(initialChapter !== undefined ? initialChapter : 0);
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<string>('');
  const [editingNote, setEditingNote] = useState<SharedNote | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (initialChapter !== undefined) {
      setCurrentChapter(initialChapter);
    }
  }, [initialChapter]);

  useEffect(() => {
    fetchNotes();
  }, [bookId, user]);

  const fetchNotes = async () => {
    if (!bookId || !user) return;

    try {
      const { data: notesData, error } = await supabase
        .from('shared_chapter_notes')
        .select(`
          *,
          profiles:user_id (
            display_name,
            email
          )
        `)
        .eq('book_id', bookId)
        .order('chapter_number', { ascending: true });

      if (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: "오류",
          description: "기록을 불러오는데 실패했습니다.",
          variant: "destructive"
        });
        return;
      }

      const notesWithAuthor = (notesData || []).map(note => ({
        ...note,
        author_name: (note.profiles as any)?.display_name,
        author_email: (note.profiles as any)?.email
      }));

      setNotes(notesWithAuthor);
    } catch (error) {
      console.error('Error in fetchNotes:', error);
      toast({
        title: "오류",
        description: "기록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentChapterNotes = notes.filter(note => note.chapter_number === currentChapter);
  const userNote = currentChapterNotes.find(note => note.user_id === user?.id);

  const handleSaveNote = async () => {
    if (!user || !currentNote.trim()) return;

    try {
      const noteData = {
        book_id: bookId,
        chapter_number: currentChapter,
        chapter_title: chapters[currentChapter] || `Chapter ${currentChapter + 1}`,
        content: currentNote,
        user_id: user.id
      };

      let result;
      if (userNote) {
        // 업데이트
        result = await supabase
          .from('shared_chapter_notes')
          .update({ content: currentNote, updated_at: new Date().toISOString() })
          .eq('id', userNote.id);
      } else {
        // 새로 생성
        result = await supabase
          .from('shared_chapter_notes')
          .insert([noteData]);
      }

      if (result.error) {
        console.error('Error saving note:', result.error);
        toast({
          title: "오류",
          description: "기록 저장에 실패했습니다.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "성공",
        description: "기록이 저장되었습니다."
      });

      setCurrentNote('');
      setIsWriteDialogOpen(false);
      setIsEditDialogOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Error in handleSaveNote:', error);
      toast({
        title: "오류",
        description: "기록 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleEditNote = (note: SharedNote) => {
    setEditingNote(note);
    setCurrentNote(note.content);
    setIsEditDialogOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('shared_chapter_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Error deleting note:', error);
        toast({
          title: "오류",
          description: "기록 삭제에 실패했습니다.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "성공",
        description: "기록이 삭제되었습니다."
      });

      fetchNotes();
    } catch (error) {
      console.error('Error in handleDeleteNote:', error);
      toast({
        title: "오류",
        description: "기록 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const goPrev = () => {
    setCurrentChapter((idx) => Math.max(0, idx - 1));
  };

  const goNext = () => {
    setCurrentChapter((idx) => Math.min(chapters.length - 1, idx + 1));
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>챕터별 학습 기록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button onClick={goPrev} disabled={currentChapter === 0} size="sm">이전</Button>
            <span className="font-bold text-lg">{chapters[currentChapter]}</span>
            <Button onClick={goNext} disabled={currentChapter === chapters.length - 1} size="sm">다음</Button>
          </div>
          
          <div className="flex gap-2 mb-4">
            {userNote ? (
              <Button onClick={() => handleEditNote(userNote)} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                내 기록 수정
              </Button>
            ) : (
              <Dialog open={isWriteDialogOpen} onOpenChange={setIsWriteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    기록 작성
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>기록 작성: {chapters[currentChapter]}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="이 챕터에서 학습한 내용을 기록해주세요..."
                      className="min-h-[200px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsWriteDialogOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleSaveNote} disabled={!currentNote.trim()}>
                        저장
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* 현재 챕터의 모든 기록 표시 */}
          <div className="space-y-4">
            {currentChapterNotes.length > 0 ? (
              currentChapterNotes.map((note) => (
                <Card key={note.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {note.author_name || note.author_email || '익명'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(note.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      {note.user_id === user?.id && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditNote(note)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">
                      {note.content}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                해당 챕터에 기록이 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>기록 수정: {chapters[currentChapter]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="이 챕터에서 학습한 내용을 기록해주세요..."
              className="min-h-[200px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSaveNote} disabled={!currentNote.trim()}>
                수정 완료
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>전체 기록 히스토리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {chapters.map((ch, idx) => {
            const chapterNotes = notes.filter(note => note.chapter_number === idx);
            return (
              <div 
                key={idx} 
                className="flex items-center gap-2 border-b py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setCurrentChapter(idx)}
              >
                <span className="w-56">{ch}</span>
                <div className="flex gap-1">
                  {chapterNotes.map((note) => (
                    <Badge key={note.id} variant="outline" className="text-xs">
                      {note.author_name || note.author_email || '익명'}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}