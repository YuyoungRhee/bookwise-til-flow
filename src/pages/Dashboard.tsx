import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import BookCard from '@/components/BookCard';
import ChapterItem from '@/components/ChapterItem';
import StudyCalendar from '@/components/StudyCalendar';
import WeeklyMonthlyProgress from '@/components/WeeklyMonthlyProgress';
import BookSummary from '@/components/BookSummary';
import { Book, Calendar, Edit, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [currentBooks, setCurrentBooks] = useState(() => {
    const stored = window.localStorage.getItem('dashboardBooks');
    return stored ? JSON.parse(stored) : [
      {
        title: "클린 코드",
        author: "로버트 C. 마틴",
        progress: 65,
        totalChapters: 17,
        completedChapters: 11,
      },
      {
        title: "자바스크립트 완벽 가이드",
        author: "데이비드 플래너건",
        progress: 23,
        totalChapters: 28,
        completedChapters: 6,
      },
      {
        title: "리팩터링 2판",
        author: "마틴 파울러",
        progress: 10,
        totalChapters: 12,
        completedChapters: 2,
        pages: 550,
        chapters: [
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
        ],
        plan: {
          targetDate: '2024-08-31',
          dailyChapters: '1',
          dailyPages: '',
          expectedEnd: '2024-08-31',
          autoDaily: null
        }
      }
    ];
  });

  const todayChapters = [
    { number: 12, title: "주석", bookTitle: "클린 코드", isCompleted: false, isToday: true },
    { number: 3, title: "코드에서 나는 악취", bookTitle: "리팩터링 2판", isCompleted: false, isToday: true },
  ];

  const recentNotes = [
    { title: "의미 있는 이름", bookTitle: "클린 코드", date: "2024-07-01" },
    { title: "함수", bookTitle: "클린 코드", date: "2024-06-30" },
  ];

  useEffect(() => {
    const stored = window.localStorage.getItem('dashboardBooks');
    let books = stored ? JSON.parse(stored) : [];
    const hasRefactoring = books.some((b: any) => b.title === '리팩터링 2판');
    if (!hasRefactoring) {
      books = [
        ...books,
        {
          title: "리팩터링 2판",
          author: "마틴 파울러",
          progress: 10,
          totalChapters: 12,
          completedChapters: 2,
          pages: 550,
          chapters: [
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
          ],
          plan: {
            targetDate: '2024-08-31',
            dailyChapters: '1',
            dailyPages: '',
            expectedEnd: '2024-08-31',
            autoDaily: null
          }
        }
      ];
      window.localStorage.setItem('dashboardBooks', JSON.stringify(books));
    }
    setCurrentBooks(books);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const book = e.detail;
      if (!currentBooks.some(b => b.title === book.title)) {
        let newBook;
        if (book.title === '이것이 자바다') {
          newBook = {
            title: book.title,
            author: book.author,
            progress: 0,
            totalChapters: 25,
            completedChapters: 0,
            pages: 1112,
            parts: [
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
            ],
            plan: book.plan || undefined,
          };
        } else {
          newBook = { ...book, plan: book.plan || undefined };
        }
        const updated = [...currentBooks, newBook];
        setCurrentBooks(updated);
        window.localStorage.setItem('dashboardBooks', JSON.stringify(updated));
      }
    };
    window.addEventListener('add-book', handler);
    return () => window.removeEventListener('add-book', handler);
  }, [currentBooks]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold study-text">학습 대시보드</h1>
        <p className="text-lg text-muted-foreground">
          체계적인 독서로 더 나은 학습을 시작하세요
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/search">
          <Card className="hover:book-shadow transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-medium group-hover:text-primary transition-colors">책 검색</h3>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Books */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="book-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                현재 학습 중인 책
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentBooks.length > 0 ? (
                currentBooks.map((book, index) => (
                  <div key={index} className="space-y-2">
                    <BookCard {...book} />
                    {book.progress === 100 && (
                      <BookSummary bookTitle={book.title} />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">아직 등록된 책이 없습니다</p>
                  <Link to="/search">
                    <Button>첫 번째 책 추가하기</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Chapters */}
          <Card className="book-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                오늘 학습할 챕터
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayChapters.map((chapter, index) => (
                <ChapterItem key={index} {...chapter} />
              ))}
            </CardContent>
          </Card>

          {/* Study Calendar */}
          <StudyCalendar />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weekly/Monthly Progress */}
          <WeeklyMonthlyProgress />

          {/* Today's Progress */}
          <Card className="book-shadow">
            <CardHeader>
              <CardTitle className="text-lg">오늘의 진행률</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">2</div>
                <p className="text-sm text-muted-foreground">완료한 챕터</p>
              </div>
              <Progress value={40} className="progress-fill" />
              <p className="text-xs text-muted-foreground text-center">
                오늘 목표의 40% 달성
              </p>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card className="book-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit className="w-4 h-4" />
                최근 학습 기록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotes.map((note, index) => (
                <div key={index} className="border-l-2 border-accent pl-3">
                  <h4 className="font-medium text-sm">{note.title}</h4>
                  <p className="text-xs text-muted-foreground">{note.bookTitle}</p>
                  <p className="text-xs text-muted-foreground">{note.date}</p>
                </div>
              ))}
              <Link to="/notes">
                <Button variant="outline" size="sm" className="w-full">
                  모든 기록 보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}