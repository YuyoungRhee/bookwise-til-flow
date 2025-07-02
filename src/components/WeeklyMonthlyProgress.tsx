import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ProgressData {
  completed: number;
  total: number;
  percentage: number;
}

export default function WeeklyMonthlyProgress() {
  const [weeklyProgress, setWeeklyProgress] = useState<ProgressData>({ completed: 0, total: 0, percentage: 0 });
  const [monthlyProgress, setMonthlyProgress] = useState<ProgressData>({ completed: 0, total: 0, percentage: 0 });

  useEffect(() => {
    calculateProgress();
  }, []);

  const calculateProgress = () => {
    const notes = JSON.parse(window.localStorage.getItem('chapterNotes') || '[]');
    const books = JSON.parse(window.localStorage.getItem('dashboardBooks') || '[]');
    
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 월요일 시작
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // 이번 주 기록 계산
    const weeklyRecords = notes.filter((note: any) => {
      const noteDate = new Date(note.updatedAt || note.createdAt);
      return isWithinInterval(noteDate, { start: weekStart, end: weekEnd });
    });

    // 이번 달 기록 계산
    const monthlyRecords = notes.filter((note: any) => {
      const noteDate = new Date(note.updatedAt || note.createdAt);
      return isWithinInterval(noteDate, { start: monthStart, end: monthEnd });
    });

    // 전체 챕터 수 계산 (활성 책들 기준)
    const totalChapters = books.reduce((sum: number, book: any) => {
      return sum + (book.totalChapters || book.chapters?.length || 0);
    }, 0);

    // 이번 주 목표: 주 7일 * 활성 책 수 (대략적인 목표)
    const weeklyTarget = Math.max(7, books.length * 7);
    const monthlyTarget = Math.max(30, totalChapters);

    setWeeklyProgress({
      completed: weeklyRecords.length,
      total: weeklyTarget,
      percentage: weeklyTarget > 0 ? Math.round((weeklyRecords.length / weeklyTarget) * 100) : 0
    });

    setMonthlyProgress({
      completed: monthlyRecords.length,
      total: monthlyTarget,
      percentage: monthlyTarget > 0 ? Math.round((monthlyRecords.length / monthlyTarget) * 100) : 0
    });
  };

  return (
    <Card className="book-shadow">
      <CardHeader>
        <CardTitle>📊 목표 달성 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">이번 주</TabsTrigger>
            <TabsTrigger value="monthly">이번 달</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>주간 학습 목표</span>
                <span>{weeklyProgress.completed}/{weeklyProgress.total}</span>
              </div>
              <Progress value={weeklyProgress.percentage} className="progress-fill" />
              <div className="text-xs text-muted-foreground text-center">
                {weeklyProgress.percentage}% 달성
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>📅 {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'M월 d일', { locale: ko })} ~ {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'M월 d일', { locale: ko })}</p>
              {weeklyProgress.completed > 0 && (
                <p className="text-accent mt-1">✨ 이번 주 {weeklyProgress.completed}개 챕터 완료!</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>월간 학습 목표</span>
                <span>{monthlyProgress.completed}/{monthlyProgress.total}</span>
              </div>
              <Progress value={monthlyProgress.percentage} className="progress-fill" />
              <div className="text-xs text-muted-foreground text-center">
                {monthlyProgress.percentage}% 달성
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>📅 {format(new Date(), 'yyyy년 M월', { locale: ko })}</p>
              {monthlyProgress.completed > 0 && (
                <p className="text-accent mt-1">📚 이번 달 {monthlyProgress.completed}개 챕터 완료!</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}