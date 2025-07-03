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

      // 2. 참여 멤버 수 및 정보 가져오기
      const { data: members, error: membersError } = await supabase
        .from('book_members')
        .select(`
          user_id,
          profiles:user_id (
            display_name,
            email
          )
        `)
        .eq('book_id', bookId);

      if (membersError) {
        console.error('Error fetching members:', membersError);
      }

      // 책 정보에 멤버 정보 추가
      const bookWithMembers: SharedBook = {
        ...book,
        member_count: members?.length || 0,
        members: members?.map(m => ({
          id: m.user_id,
          display_name: (m.profiles as any)?.display_name,
          email: (m.profiles as any)?.email
        })) || []
      };

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
            <TabsTrigger value="plan">학습 계획</TabsTrigger>
            <TabsTrigger value="records">기록/히스토리</TabsTrigger>
          </TabsList>
          <TabsContent value="chapters">
            <ChapterManager 
              parts={currentBook.parts} 
              chapters={currentBook.chapters} 
              bookId={currentBook.id} 
            />
          </TabsContent>
          <TabsContent value="plan">
            <PlanManager 
              pages={currentBook.pages} 
              parts={currentBook.parts} 
              chapters={currentBook.chapters} 
              bookId={currentBook.id} 
            />
          </TabsContent>
          <TabsContent value="records">
            <SharedRecordManager 
              initialChapter={initialChapter}
              bookId={currentBook.id}
              bookTitle={currentBook.title}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}