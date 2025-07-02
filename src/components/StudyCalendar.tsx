import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface StudyRecord {
  date: string;
  hasRecord: boolean;
  bookTitle: string;
  chapterTitle: string;
}

export default function StudyCalendar() {
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    // localStorage에서 chapterNotes 가져오기
    const notes = JSON.parse(window.localStorage.getItem('chapterNotes') || '[]');
    
    // 날짜별 기록 정리
    const recordsByDate: Record<string, StudyRecord[]> = {};
    notes.forEach((note: any) => {
      const date = note.updatedAt ? note.updatedAt.slice(0, 10) : format(new Date(), 'yyyy-MM-dd');
      if (!recordsByDate[date]) {
        recordsByDate[date] = [];
      }
      recordsByDate[date].push({
        date,
        hasRecord: true,
        bookTitle: note.bookTitle,
        chapterTitle: note.chapterTitle || `Chapter ${note.chapterIndex + 1}`
      });
    });

    const records = Object.values(recordsByDate).flat();
    setStudyRecords(records);

    // 연속 기록일 계산
    calculateStreak(Object.keys(recordsByDate));
  }, []);

  const calculateStreak = (recordDates: string[]) => {
    const sortedDates = recordDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = format(new Date(), 'yyyy-MM-dd');
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) { // 최대 1년까지 체크
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (sortedDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // 오늘이 아니면 연속 기록 중단
        if (dateStr !== today) break;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }
    
    setStreakDays(streak);
  };

  const hasRecordOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return studyRecords.some(record => record.date === dateStr);
  };

  const getRecordsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return studyRecords.filter(record => record.date === dateStr);
  };

  return (
    <Card className="book-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            📅 학습 달력
          </span>
          {streakDays > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
              🔥 {streakDays}일 연속 기록중!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ko}
          className={cn("w-full pointer-events-auto")}
          modifiers={{
            hasRecord: (date) => hasRecordOnDate(date)
          }}
          modifiersStyles={{
            hasRecord: {
              backgroundColor: 'hsl(var(--accent))',
              color: 'hsl(var(--accent-foreground))',
              fontWeight: 'bold'
            }
          }}
          components={{
            Day: ({ date, displayMonth, ...props }) => {
              const hasRecord = hasRecordOnDate(date);
              return (
                <div className="relative">
                  <button {...props as any} className={cn(
                    (props as any).className,
                    hasRecord && "bg-accent text-accent-foreground font-bold relative"
                  )}>
                    {format(date, 'd')}
                    {hasRecord && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white">🔥</span>
                      </div>
                    )}
                  </button>
                </div>
              );
            }
          }}
        />
        
        {selectedDate && (
          <div className="mt-4 p-3 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">
              {format(selectedDate, 'PPP', { locale: ko })}
            </h4>
            {getRecordsForDate(selectedDate).length > 0 ? (
              <div className="space-y-2">
                {getRecordsForDate(selectedDate).map((record, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">{record.bookTitle}</div>
                    <div className="text-muted-foreground">{record.chapterTitle}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">이 날에는 학습 기록이 없습니다.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}