import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import BookCard from '@/components/BookCard';
import ChapterItem from '@/components/ChapterItem';
import { Book, Calendar, Edit, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  // Mock data for demonstration
  const currentBooks = [
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
    }
  ];

  const todayChapters = [
    { number: 12, title: "주석", isCompleted: false, isToday: true },
    { number: 13, title: "형식 맞추기", isCompleted: false, isToday: true },
  ];

  const recentNotes = [
    { title: "의미 있는 이름", bookTitle: "클린 코드", date: "2024-07-01" },
    { title: "함수", bookTitle: "클린 코드", date: "2024-06-30" },
  ];

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
        
        <Link to="/plan">
          <Card className="hover:book-shadow transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-medium group-hover:text-primary transition-colors">학습 계획</h3>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/notes">
          <Card className="hover:book-shadow transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Edit className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-medium group-hover:text-primary transition-colors">학습 기록</h3>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/settings">
          <Card className="hover:book-shadow transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Book className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-medium group-hover:text-primary transition-colors">설정</h3>
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
                  <BookCard key={index} {...book} />
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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