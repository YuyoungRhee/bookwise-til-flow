import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Save, Clock, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function NoteWriting() {
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const chapterIndex = searchParams.get('chapter');
  const navigate = useNavigate();
  
  const [currentBook, setCurrentBook] = useState<any>(null);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [noteContent, setNoteContent] = useState('');
  const [existingNote, setExistingNote] = useState<any>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('dashboardBooks');
    const books = stored ? JSON.parse(stored) : [];
    const book = books.find((b: any) => decodeURIComponent(bookId || '') === b.title);
    
    if (book && chapterIndex !== null) {
      const chapter = book.chapters[parseInt(chapterIndex)];
      setCurrentBook(book);
      setCurrentChapter(chapter);
      
      // 기존 기록이 있는지 확인
      const notes = JSON.parse(window.localStorage.getItem('chapterNotes') || '[]');
      const existing = notes.find((note: any) => 
        note.bookTitle === book.title && note.chapterIndex === parseInt(chapterIndex)
      );
      
      if (existing) {
        setExistingNote(existing);
        setNoteContent(existing.content);
      }
    }
  }, [bookId, chapterIndex]);

  const saveNote = () => {
    if (!currentBook || !currentChapter || chapterIndex === null) return;

    const notes = JSON.parse(window.localStorage.getItem('chapterNotes') || '[]');
    const noteData = {
      bookTitle: currentBook.title,
      bookAuthor: currentBook.author,
      chapterIndex: parseInt(chapterIndex),
      chapterTitle: currentChapter.title,
      content: noteContent,
      createdAt: existingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingNote) {
      // 기존 기록 업데이트
      const index = notes.findIndex((note: any) => 
        note.bookTitle === currentBook.title && note.chapterIndex === parseInt(chapterIndex)
      );
      notes[index] = noteData;
    } else {
      // 새 기록 추가
      notes.push(noteData);
    }

    window.localStorage.setItem('chapterNotes', JSON.stringify(notes));

    // 챕터 완료 상태 업데이트
    const books = JSON.parse(window.localStorage.getItem('dashboardBooks') || '[]');
    const bookIndex = books.findIndex((b: any) => b.title === currentBook.title);
    
    if (bookIndex !== -1) {
      if (!books[bookIndex].completedChapters) {
        books[bookIndex].completedChapters = [];
      }
      
      if (!books[bookIndex].completedChapters.includes(parseInt(chapterIndex))) {
        books[bookIndex].completedChapters.push(parseInt(chapterIndex));
        books[bookIndex].progress = (books[bookIndex].completedChapters.length / books[bookIndex].chapters.length) * 100;
      }
      
      window.localStorage.setItem('dashboardBooks', JSON.stringify(books));
      window.dispatchEvent(new CustomEvent('add-book', { detail: { updated: true } }));
    }

    navigate(`/books/${encodeURIComponent(currentBook.title)}`);
  };

  if (!currentBook || !currentChapter) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">챕터를 찾을 수 없습니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isCompleted = currentBook.completedChapters?.includes(parseInt(chapterIndex || '0'));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold study-text">챕터 기록 작성</h1>
            <p className="text-muted-foreground mt-2">
              학습한 내용을 자유롭게 기록해보세요
            </p>
          </div>
          {isCompleted && (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              완료됨
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              챕터 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">책 제목</span>
                <p className="font-medium">{currentBook.title}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">저자</span>
                <p className="font-medium">{currentBook.author}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">챕터</span>
                <p className="font-medium">{currentChapter.title}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">페이지</span>
                <p className="font-medium">
                  {currentChapter.startPage}p - {currentChapter.endPage}p
                </p>
              </div>
            </div>
            
            {existingNote && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    작성일: {format(new Date(existingNote.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                  </span>
                  {existingNote.updatedAt !== existingNote.createdAt && (
                    <span>
                      • 수정일: {format(new Date(existingNote.updatedAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>학습 기록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="이 챕터에서 학습한 내용을 자유롭게 기록해보세요.&#10;&#10;예시:&#10;- 핵심 개념과 용어&#10;- 인상 깊었던 내용&#10;- 질문이나 궁금한 점&#10;- 실습 내용&#10;- 다른 챕터와의 연관성 등"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={saveNote} 
                disabled={!noteContent.trim()}
                className="flex-1 gap-2"
              >
                <Save className="w-4 h-4" />
                {existingNote ? '기록 수정하기' : '기록 저장하기'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/books/${encodeURIComponent(currentBook.title)}`)}
              >
                취소
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              💡 기록을 저장하면 해당 챕터가 자동으로 완료 처리됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}