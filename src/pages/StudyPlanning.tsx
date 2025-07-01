import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, Target, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { format, addDays, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function StudyPlanning() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [currentBook, setCurrentBook] = useState<any>(null);
  const [planType, setPlanType] = useState<'target-date' | 'daily-chapters'>('target-date');
  const [targetDate, setTargetDate] = useState<Date>();
  const [dailyChapters, setDailyChapters] = useState<string>('1');
  const [calculatedResult, setCalculatedResult] = useState<any>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('dashboardBooks');
    const books = stored ? JSON.parse(stored) : [];
    const book = books.find((b: any) => decodeURIComponent(bookId || '') === b.title);
    setCurrentBook(book);
  }, [bookId]);

  const calculatePlan = () => {
    if (!currentBook) return;

    const totalChapters = currentBook.chapters?.length || 0;
    const completedChapters = currentBook.completedChapters || 0;
    const remainingChapters = totalChapters - completedChapters;

    if (planType === 'target-date' && targetDate) {
      const today = new Date();
      const daysUntilTarget = differenceInDays(targetDate, today);
      const chaptersPerDay = daysUntilTarget > 0 ? Math.ceil(remainingChapters / daysUntilTarget) : remainingChapters;
      
      setCalculatedResult({
        type: 'target-date',
        targetDate,
        daysUntilTarget,
        chaptersPerDay,
        remainingChapters
      });
    } else if (planType === 'daily-chapters') {
      const chaptersPerDay = parseInt(dailyChapters) || 1;
      const daysNeeded = Math.ceil(remainingChapters / chaptersPerDay);
      const estimatedEndDate = addDays(new Date(), daysNeeded);
      
      setCalculatedResult({
        type: 'daily-chapters',
        chaptersPerDay,
        daysNeeded,
        estimatedEndDate,
        remainingChapters
      });
    }
  };

  const savePlan = () => {
    if (!currentBook || !calculatedResult) return;

    const stored = window.localStorage.getItem('dashboardBooks');
    const books = stored ? JSON.parse(stored) : [];
    const bookIndex = books.findIndex((b: any) => b.title === currentBook.title);
    
    if (bookIndex !== -1) {
      books[bookIndex].plan = calculatedResult;
      window.localStorage.setItem('dashboardBooks', JSON.stringify(books));
      window.dispatchEvent(new CustomEvent('add-book', { detail: { updated: true } }));
      navigate('/');
    }
  };

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">책을 찾을 수 없습니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold study-text">학습 계획 수립</h1>
          <p className="text-muted-foreground mt-2">
            <span className="font-medium">{currentBook.title}</span>의 학습 계획을 세워보세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                책 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                {currentBook.cover && (
                  <img 
                    src={currentBook.cover} 
                    alt={currentBook.title}
                    className="w-16 h-20 object-cover rounded border book-shadow"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{currentBook.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentBook.author}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">총 챕터</span>
                  <p className="font-medium">{currentBook.chapters?.length || 0}개</p>
                </div>
                <div>
                  <span className="text-muted-foreground">완료 챕터</span>
                  <p className="font-medium">{currentBook.completedChapters || 0}개</p>
                </div>
                <div>
                  <span className="text-muted-foreground">남은 챕터</span>
                  <p className="font-medium text-primary">
                    {(currentBook.chapters?.length || 0) - (currentBook.completedChapters || 0)}개
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">진행률</span>
                  <p className="font-medium">{Math.round(currentBook.progress || 0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                계획 유형 선택
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={planType} onValueChange={(value: any) => setPlanType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="target-date" id="target-date" />
                  <Label htmlFor="target-date">목표 완료일 설정</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily-chapters" id="daily-chapters" />
                  <Label htmlFor="daily-chapters">하루 학습량 설정</Label>
                </div>
              </RadioGroup>

              {planType === 'target-date' ? (
                <div className="space-y-3">
                  <Label>목표 완료일</Label>
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    disabled={(date) => date < new Date()}
                    locale={ko}
                    className="rounded-md border"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="daily-chapters-input">하루 학습할 챕터 수</Label>
                  <Input
                    id="daily-chapters-input"
                    type="number"
                    min="1"
                    value={dailyChapters}
                    onChange={(e) => setDailyChapters(e.target.value)}
                    placeholder="예: 2"
                  />
                </div>
              )}

              <Button onClick={calculatePlan} className="w-full">
                계획 계산하기
              </Button>
            </CardContent>
          </Card>
        </div>

        {calculatedResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                계산 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {calculatedResult.type === 'target-date' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">목표일</Badge>
                    <p className="font-semibold">
                      {format(calculatedResult.targetDate, 'MM월 dd일', { locale: ko })}
                    </p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">남은 기간</Badge>
                    <p className="font-semibold text-primary">
                      {calculatedResult.daysUntilTarget}일
                    </p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">하루 학습량</Badge>
                    <p className="font-semibold text-primary">
                      {calculatedResult.chaptersPerDay}챕터/일
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">하루 학습량</Badge>
                    <p className="font-semibold">
                      {calculatedResult.chaptersPerDay}챕터/일
                    </p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">예상 소요일</Badge>
                    <p className="font-semibold text-primary">
                      {calculatedResult.daysNeeded}일
                    </p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">예상 완료일</Badge>
                    <p className="font-semibold text-primary">
                      {format(calculatedResult.estimatedEndDate, 'MM월 dd일', { locale: ko })}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button onClick={savePlan} className="flex-1">
                  계획 저장하기
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  대시보드로 이동
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}