import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ChapterManager from '@/components/ChapterManager';
import PlanManager from '@/components/PlanManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import SharedRecordManager from '@/components/SharedRecordManager';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Board from '@/components/Board';

interface SharedBook {
  id: string;
  title: string;
  author: string;
  pages?: number;
  parts?: any;
  chapters?: string[];
  total_chapters?: number;
  member_count?: number;
  members?: Array<{
    id: string;
    display_name?: string;
    email?: string;
  }>;
}

export default function SharedBookDetail() {
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const chapterParam = searchParams.get('chapter');
  const tabValue = tabParam === 'record' ? 'records' : (tabParam || 'chapters');
  const initialChapter = chapterParam ? Number(chapterParam) : undefined;
  const [currentBook, setCurrentBook] = useState<SharedBook | null>(null);
  const [activeTab, setActiveTab] = useState(tabValue);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [progressList, setProgressList] = useState<any[]>([]);

  useEffect(() => {
    setActiveTab(tabValue);
  }, [tabValue]);

  useEffect(() => {
    fetchBookDetails();
  }, [bookId, user]);

  const fetchBookDetails = async () => {
    if (!bookId || !user) return;

    try {
      // 1. 책 정보 가져오기
      const { data: book, error: bookError } = await supabase
        .from('shared_books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (bookError || !book) {
        console.error('Error fetching book:', bookError);
        toast({
          title: "오류",
          description: "책 정보를 불러올 수 없습니다.",
          variant: "destructive"
        });
        return;
      }

      // 2. 참여 멤버 수 가져오기 (간단한 방법)
      let memberCount = 0;
      let members: any[] = [];

      try {
        console.log('Fetching members for book:', bookId);
        
        // 먼저 멤버 수만 가져오기
        const { count, error: countError } = await supabase
          .from('book_members')
          .select('*', { count: 'exact', head: true })
          .eq('book_id', bookId);

        console.log('Member count result:', { count, countError });

        if (!countError) {
          memberCount = count || 0;
        }

        // 멤버 정보 가져오기 (선택적)
        const { data: membersData, error: membersError } = await supabase
          .from('book_members')
          .select(`
            user_id,
            profiles:user_id (
              display_name,
              email
            )
          `)
          .eq('book_id', bookId);

        console.log('Members data result:', { membersData, membersError });

        if (!membersError && membersData) {
          members = membersData.map(m => ({
            id: m.user_id,
            display_name: (m.profiles as any)?.display_name,
            email: (m.profiles as any)?.email
          }));
        }

        // RLS 정책 문제일 경우를 대비한 대안 방법
        if (membersError || !membersData || membersData.length === 0) {
          console.log('Trying alternative method to get members...');
          
          // 사용자 ID만 먼저 가져오기
          const { data: userIds, error: userIdsError } = await supabase
            .from('book_members')
            .select('user_id')
            .eq('book_id', bookId);

          console.log('User IDs result:', { userIds, userIdsError });

          if (!userIdsError && userIds && userIds.length > 0) {
            // 각 사용자의 프로필 정보 개별 조회
            const userProfiles = await Promise.all(
              userIds.map(async (member) => {
                try {
                  const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('display_name, email')
                    .eq('user_id', member.user_id)
                    .single();

                  if (!profileError && profile) {
                    return {
                      id: member.user_id,
                      display_name: profile.display_name,
                      email: profile.email
                    };
                  }
                  return {
                    id: member.user_id,
                    display_name: 'Unknown User',
                    email: ''
                  };
                } catch (error) {
                  console.error('Error fetching profile for user:', member.user_id, error);
                  return {
                    id: member.user_id,
                    display_name: 'Unknown User',
                    email: ''
                  };
                }
              })
            );

            members = userProfiles.filter(Boolean);
            console.log('Alternative members result:', members);
          }
        }
      } catch (memberError) {
        console.error('Error fetching members:', memberError);
        // 멤버 정보 가져오기 실패해도 책 정보는 표시
      }

      // 책 정보에 멤버 정보 추가
      const bookWithMembers: SharedBook = {
        ...book,
        member_count: memberCount,
        members: members
      };

      console.log('Book with members:', bookWithMembers);
      setCurrentBook(bookWithMembers);
    } catch (error) {
      console.error('Error in fetchBookDetails:', error);
      toast({
        title: "오류",
        description: "책 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 멤버별 진도 정보 fetch
  const fetchProgressList = async (book: SharedBook) => {
    if (!book || !book.members || book.members.length === 0) return;
    const userIds = book.members.map(m => m.id);
    // @ts-ignore: shared_book_progress는 supabase 타입에 아직 없음
    const { data, error } = await (supabase as any)
      .from('shared_book_progress')
      .select('*')
      .eq('book_id', book.id)
      .in('user_id', userIds);
    if (!error && data) setProgressList(data);
    else setProgressList([]);
  };

  useEffect(() => {
    if (currentBook) {
      fetchProgressList(currentBook);
    }
  }, [currentBook]);

  // 본인 진도(progress) 추출
  const myProgress = user ? progressList.find(p => p.user_id === user.id) : undefined;

  // Supabase에 본인 진도 저장/수정 함수
  const handleSaveMyProgress = async (progress: any) => {
    if (!currentBook || !user) return;
    // @ts-ignore: shared_book_progress는 supabase 타입에 아직 없음
    const { error } = await (supabase as any)
      .from('shared_book_progress')
      .upsert({
        book_id: currentBook.id,
        user_id: user.id,
        completed_chapters: progress.completed_chapters,
        completed_pages: progress.completed_pages,
        progress_mode: progress.progress_mode,
        is_completed: progress.is_completed,
        updated_at: new Date().toISOString(),
      }, { onConflict: ['book_id', 'user_id'] });
    if (!error) {
      // 저장 후 진도 현황 새로고침
      fetchProgressList(currentBook);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-8">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-8">책을 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{currentBook.title}</CardTitle>
                {currentBook.author && (
                  <p className="text-muted-foreground mt-1">{currentBook.author}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {currentBook.member_count}명 참여
                </Badge>
              </div>
            </div>
          </CardHeader>
          {currentBook.members && currentBook.members.length > 0 && (
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">참여 멤버:</p>
                <div className="flex flex-wrap gap-2">
                  {currentBook.members.map((member) => (
                    <Badge key={member.id} variant="outline" className="text-xs">
                      {member.display_name || member.email || '익명'}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="chapters">챕터 관리</TabsTrigger>
            <TabsTrigger value="plan">학습 계획 / 진도 관리</TabsTrigger>
            <TabsTrigger value="records">기록/히스토리</TabsTrigger>
            <TabsTrigger value="board">게시판</TabsTrigger>
          </TabsList>
          <TabsContent value="chapters">
            <ChapterManager 
              parts={currentBook.parts} 
              chapters={currentBook.chapters} 
              bookId={currentBook.id} 
            />
          </TabsContent>
          <TabsContent value="plan">
            {/* 1. 학습 계획/내 진도 입력(PlanManager) */}
            <PlanManager 
              pages={currentBook.pages} 
              parts={currentBook.parts} 
              chapters={currentBook.chapters} 
              bookId={currentBook.id} 
              sharedMode={true}
              userId={user?.id}
              progress={myProgress}
              onSaveProgress={handleSaveMyProgress}
            />
            {/* 2. 멤버별 진도 현황 표 */}
            <Card className="mb-6 mt-8">
              <CardHeader>
                <CardTitle>멤버별 진도 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-2 py-1 border">멤버</th>
                        <th className="px-2 py-1 border">완료 챕터</th>
                        <th className="px-2 py-1 border">완료 페이지</th>
                        <th className="px-2 py-1 border">진행률</th>
                        <th className="px-2 py-1 border">완료 여부</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBook.members.map(member => {
                        const progress = progressList.find(p => p.user_id === member.id) || {};
                        const totalChapters = currentBook.total_chapters || 0;
                        const totalPages = currentBook.pages || 0;
                        const percent = progress.progress_mode === 'page'
                          ? (progress.completed_pages || 0) / (totalPages || 1) * 100
                          : (progress.completed_chapters || 0) / (totalChapters || 1) * 100;
                        return (
                          <tr key={member.id}>
                            <td className="px-2 py-1 border">{member.display_name || member.email || '익명'}</td>
                            <td className="px-2 py-1 border">{progress.completed_chapters || 0} / {totalChapters}</td>
                            <td className="px-2 py-1 border">{progress.completed_pages || 0} / {totalPages}</td>
                            <td className="px-2 py-1 border">{Math.round(percent)}%</td>
                            <td className="px-2 py-1 border text-center">{progress.is_completed ? '✅' : ''}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="records">
            <SharedRecordManager 
              initialChapter={initialChapter}
              bookId={currentBook.id}
              bookTitle={currentBook.title}
            />
          </TabsContent>
          <TabsContent value="board">
            <Board bookId={currentBook.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}