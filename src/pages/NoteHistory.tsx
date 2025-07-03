import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Book, FileText, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { format, isToday, isYesterday, isSameDay, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function NoteHistory() {
  const [notes, setNotes] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const storedNotes = JSON.parse(window.localStorage.getItem('chapterNotes') || '[]');
    const storedBooks = JSON.parse(window.localStorage.getItem('dashboardBooks') || '[]');
    
    setNotes(storedNotes.sort((a: any, b: any) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
    setBooks(storedBooks);
  }, []);

  // 날짜별 그룹화
  const groupNotesByDate = (notes: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    notes.forEach(note => {
      const date = format(new Date(note.updatedAt), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(note);
    });
    
    return groups;
  };

  // 현재 선택된 날짜의 기록만 가져오기
  const getCurrentDateNotes = () => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    return notes.filter(note => {
      const noteDate = format(new Date(note.updatedAt), 'yyyy-MM-dd');
      return noteDate === currentDateStr;
    });
  };

  // 책별 그룹화
  const groupNotesByBook = (notes: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    notes.forEach(note => {
      if (!groups[note.bookTitle]) {
        groups[note.bookTitle] = [];
      }
      groups[note.bookTitle].push(note);
    });
    
    return groups;
  };

  // 필터링된 노트들
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.bookTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBook = selectedBook === 'all' || note.bookTitle === selectedBook;
    
    const matchesDate = selectedDate === 'all' || (() => {
      const noteDate = new Date(note.updatedAt);
      switch (selectedDate) {
        case 'today':
          return isToday(noteDate);
        case 'yesterday':
          return isYesterday(noteDate);
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return noteDate >= weekAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesBook && matchesDate;
  });

  const formatRelativeDate = (date: Date) => {
    if (isToday(date)) return '오늘';
    if (isYesterday(date)) return '어제';
    return format(date, 'MM월 dd일 (eee)', { locale: ko });
  };

  const handleEditNote = (note: any) => {
    navigate(`/note-writing/${encodeURIComponent(note.bookTitle)}?chapter=${note.chapterIndex}`);
  };

  // 오늘 작성된 TIL
  const todayNotes = notes.filter(note => isToday(new Date(note.updatedAt)));

  // 선택된 날짜의 TIL
  const getCurrentDateTIL = () => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    return notes.filter(note => {
      const noteDate = format(new Date(note.updatedAt), 'yyyy-MM-dd');
      return noteDate === currentDateStr;
    });
  };

  // 날짜 네비게이션 함수들
  const goToPreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold study-text">기록 히스토리</h1>
            <p className="text-muted-foreground mt-2">
              작성한 모든 학습 기록을 조회하고 관리하세요
            </p>
          </div>

          {/* 필터 및 검색 */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="내용 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger>
                    <SelectValue placeholder="책 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 책</SelectItem>
                    {books.map(book => (
                      <SelectItem key={book.title} value={book.title}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="날짜 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 기간</SelectItem>
                    <SelectItem value="today">오늘</SelectItem>
                    <SelectItem value="yesterday">어제</SelectItem>
                    <SelectItem value="week">최근 1주일</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center">
                  <Badge variant="outline">
                    총 {filteredNotes.length}개 기록
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="date" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="date" className="gap-2">
                <Calendar className="w-4 h-4" />
                날짜별 보기
              </TabsTrigger>
              <TabsTrigger value="book" className="gap-2">
                <Book className="w-4 h-4" />
                책별 보기
              </TabsTrigger>
              <TabsTrigger value="til" className="gap-2">
                <FileText className="w-4 h-4" />
                오늘의 TIL
              </TabsTrigger>
            </TabsList>

            {/* 날짜별 보기 */}
            <TabsContent value="date">
              <Card className="mb-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousDay}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <CardTitle className="text-lg">
                        {format(currentDate, 'yyyy년 M월 d일 (eee)', { locale: ko })}
                        {isToday(currentDate) && (
                          <Badge variant="secondary" className="ml-2">
                            오늘
                          </Badge>
                        )}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextDay}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      disabled={isToday(currentDate)}
                    >
                      오늘로
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const currentDateNotes = getCurrentDateNotes().filter(note => {
                      const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           note.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           note.bookTitle.toLowerCase().includes(searchTerm.toLowerCase());
                      
                      const matchesBook = selectedBook === 'all' || note.bookTitle === selectedBook;
                      
                      return matchesSearch && matchesBook;
                    });

                    if (currentDateNotes.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            {format(currentDate, 'yyyy년 M월 d일', { locale: ko })}에 작성된 기록이 없습니다
                          </h3>
                          <p className="text-muted-foreground">
                            다른 날짜를 선택하거나 새로운 기록을 작성해보세요
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {currentDateNotes.map((note, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{note.bookTitle}</h4>
                                <p className="text-sm text-muted-foreground">{note.chapterTitle}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditNote(note)}
                                className="gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                수정
                              </Button>
                            </div>
                            <div 
                              className="text-sm line-clamp-3 ql-editor"
                              dangerouslySetInnerHTML={{ __html: note.content }}
                            />
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(note.updatedAt), 'HH:mm')}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 책별 보기 */}
            <TabsContent value="book">
              {Object.entries(groupNotesByBook(filteredNotes)).map(([bookTitle, bookNotes]) => (
                <Card key={bookTitle} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {bookTitle}
                      <Badge variant="outline" className="ml-2">
                        {bookNotes.length}개 챕터
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bookNotes.map((note, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{note.chapterTitle}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatRelativeDate(new Date(note.updatedAt))}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            className="gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            수정
                          </Button>
                        </div>
                        <div 
                          className="text-sm line-clamp-3 ql-editor"
                          dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* 선택된 날짜의 TIL */}
            <TabsContent value="til">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousDay}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {format(currentDate, 'yyyy년 M월 d일', { locale: ko })}의 TIL
                        {isToday(currentDate) && (
                          <Badge variant="secondary" className="ml-2">
                            오늘
                          </Badge>
                        )}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextDay}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      disabled={isToday(currentDate)}
                    >
                      오늘로
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const currentDateTIL = getCurrentDateTIL().filter(note => {
                      const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           note.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           note.bookTitle.toLowerCase().includes(searchTerm.toLowerCase());
                      
                      const matchesBook = selectedBook === 'all' || note.bookTitle === selectedBook;
                      
                      return matchesSearch && matchesBook;
                    });

                    if (currentDateTIL.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            {format(currentDate, 'yyyy년 M월 d일', { locale: ko })}에 작성된 기록이 없습니다
                          </h3>
                          <p className="text-muted-foreground">
                            다른 날짜를 선택하거나 새로운 기록을 작성해보세요
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        {currentDateTIL.map((note, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-lg">{note.bookTitle}</h4>
                                <p className="text-muted-foreground">{note.chapterTitle}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditNote(note)}
                                className="gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                수정
                              </Button>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <div 
                                className="ql-editor"
                                dangerouslySetInnerHTML={{ __html: note.content }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(note.updatedAt), 'HH:mm')}에 작성
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}