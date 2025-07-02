import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Save, Clock, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import RichTextEditor from '@/components/RichTextEditor';

// 리팩터링 2판 대표 챕터 mock
const refactoringChapters = [
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

export default function NoteWritingNew() {
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const chapterIndex = searchParams.get('chapter');
  const navigate = useNavigate();
  
  const [currentBook, setCurrentBook] = useState<any>(null);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [noteContent, setNoteContent] = useState('');
  const [existingNote, setExistingNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = window.localStorage.getItem('dashboardBooks');
        const books = stored ? JSON.parse(stored) : [];
        const book = books.find((b: any) => decodeURIComponent(bookId || '') === b.title);
        
        if (!book) {
          setIsLoading(false);
          return;
        }

        if (chapterIndex !== null) {
          let chapter = book.chapters?.[parseInt(chapterIndex)];
          
          // 리팩터링 2판인 경우 하드코딩된 챕터 정보 사용
          if (book.title === '리팩터링 2판' && refactoringChapters[parseInt(chapterIndex)]) {
            chapter = {
              title: refactoringChapters[parseInt(chapterIndex)],
              startPage: 1,
              endPage: 50
            };
          }
          
          // 챕터 정보가 없으면 기본 정보 생성
          if (!chapter) {
            chapter = {
              title: `Chapter ${parseInt(chapterIndex) + 1}`,
              startPage: 1,
              endPage: 50
            };
          }
          
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
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [bookId, chapterIndex]);

  const saveNote = () => {
    if (!currentBook || !currentChapter || chapterIndex === null) return;

    try {
      if (!noteContent.trim()) return;

      const notes = JSON.parse(window.localStorage.getItem('chapterNotes') || '[]');
      const noteData = {
        bookTitle: currentBook.title,
        bookAuthor: currentBook.author || 'Unknown',
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
        if (index !== -1) {
          notes[index] = noteData;
        }
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
          if (books[bookIndex].chapters) {
            books[bookIndex].progress = (books[bookIndex].completedChapters.length / books[bookIndex].chapters.length) * 100;
          }
        }
        
        window.localStorage.setItem('dashboardBooks', JSON.stringify(books));
        window.dispatchEvent(new CustomEvent('add-book', { detail: { updated: true } }));
      }

      navigate(`/books/${encodeURIComponent(currentBook.title)}`);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('기록 저장 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '날짜 정보 없음';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">로딩 중...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentBook || !currentChapter) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-muted-foreground">
                {!currentBook ? '책을 찾을 수 없습니다.' : '챕터를 찾을 수 없습니다.'}
              </p>
              {!currentBook && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  홈으로 돌아가기
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isCompleted = Array.isArray(currentBook.completedChapters) && 
    currentBook.completedChapters.includes(parseInt(chapterIndex || '0'));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
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
                <p className="font-medium">{currentBook.author || '정보 없음'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">챕터</span>
                <p className="font-medium">{currentChapter.title}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">페이지</span>
                <p className="font-medium">
                  {currentChapter.startPage || 1}p - {currentChapter.endPage || 50}p
                </p>
              </div>
            </div>
            
            {existingNote && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    작성일: {formatDate(existingNote.createdAt)}
                  </span>
                  {existingNote.updatedAt !== existingNote.createdAt && (
                    <span>
                      • 수정일: {formatDate(existingNote.updatedAt)}
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
            <RichTextEditor 
              value={noteContent}
              onChange={setNoteContent}
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