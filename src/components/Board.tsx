import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BoardProps {
  bookId: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  chapter_number?: number;
  page_number?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  user_profile?: { display_name?: string; email?: string };
  author?: { display_name?: string; email?: string };
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profile?: { display_name?: string; email?: string };
  author?: { display_name?: string; email?: string };
}

export default function Board({ bookId }: BoardProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWrite, setShowWrite] = useState(false);
  const [writeForm, setWriteForm] = useState({
    title: '',
    content: '',
    chapter_number: '',
    page_number: '',
  });
  const [commentInput, setCommentInput] = useState('');

  // 게시글 목록 불러오기
  const fetchPosts = async () => {
    setLoading(true);
    // @ts-ignore
    const { data, error } = await (supabase as any)
      .from('shared_book_posts')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });
    if (!error && data) {
      // 작성자 user_id 목록 추출
      const userIds = Array.from(new Set(data.map((p: any) => p.user_id)));
      // @ts-ignore
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);
      // user_id → profile 매핑
      const profileMap = {};
      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.user_id] = p;
        });
      }
      // posts에 작성자 정보 추가
      setPosts(data.map((p: any) => ({
        ...p,
        author: profileMap[p.user_id] || null
      })));
    }
    setLoading(false);
  };

  // 댓글 불러오기
  const fetchComments = async (postId: string) => {
    // @ts-ignore
    const { data, error } = await (supabase as any)
      .from('shared_book_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      // 작성자 user_id 목록 추출
      const userIds = Array.from(new Set(data.map((c: any) => c.user_id)));
      // @ts-ignore
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);
      // user_id → profile 매핑
      const profileMap = {};
      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.user_id] = p;
        });
      }
      // comments에 작성자 정보 추가
      setComments(data.map((c: any) => ({
        ...c,
        author: profileMap[c.user_id] || null
      })));
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [bookId]);

  // 게시글 선택 시 댓글 불러오기
  useEffect(() => {
    if (selectedPost) fetchComments(selectedPost.id);
    else setComments([]);
  }, [selectedPost]);

  // 게시글 작성
  const handleWrite = async () => {
    if (!user || !writeForm.title.trim() || !writeForm.content.trim()) return;
    // @ts-ignore
    const { error } = await (supabase as any)
      .from('shared_book_posts')
      .insert({
        book_id: bookId,
        user_id: user.id,
        title: writeForm.title,
        content: writeForm.content,
        chapter_number: writeForm.chapter_number ? Number(writeForm.chapter_number) : null,
        page_number: writeForm.page_number ? Number(writeForm.page_number) : null,
      });
    if (!error) {
      setShowWrite(false);
      setWriteForm({ title: '', content: '', chapter_number: '', page_number: '' });
      fetchPosts();
    }
  };

  // 댓글 작성
  const handleComment = async () => {
    if (!user || !selectedPost || !commentInput.trim()) return;
    // @ts-ignore
    const { error } = await (supabase as any)
      .from('shared_book_comments')
      .insert({
        post_id: selectedPost.id,
        user_id: user.id,
        content: commentInput,
      });
    if (!error) {
      setCommentInput('');
      fetchComments(selectedPost.id);
    }
  };

  return (
    <div>
      {!selectedPost ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">게시판</h2>
            <Button onClick={() => setShowWrite(v => !v)}>{showWrite ? '취소' : '글쓰기'}</Button>
          </div>
          {showWrite && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>게시글 작성</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="제목"
                  value={writeForm.title}
                  onChange={e => setWriteForm(f => ({ ...f, title: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="챕터(선택)"
                    type="number"
                    value={writeForm.chapter_number}
                    onChange={e => setWriteForm(f => ({ ...f, chapter_number: e.target.value }))}
                    className="w-32"
                  />
                  <Input
                    placeholder="페이지(선택)"
                    type="number"
                    value={writeForm.page_number}
                    onChange={e => setWriteForm(f => ({ ...f, page_number: e.target.value }))}
                    className="w-32"
                  />
                </div>
                <Textarea
                  placeholder="내용"
                  value={writeForm.content}
                  onChange={e => setWriteForm(f => ({ ...f, content: e.target.value }))}
                  className="min-h-[120px]"
                />
                <Button onClick={handleWrite}>등록</Button>
              </CardContent>
            </Card>
          )}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">아직 게시글이 없습니다.</div>
            ) : (
              posts.map(post => (
                <Card key={post.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedPost(post)}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-xs text-muted-foreground">{post.author?.display_name || post.author?.email || '익명'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end min-w-[80px]">
                      {(post.chapter_number || post.page_number) && (
                        <div className="text-sm font-semibold text-primary mb-1">
                          {post.chapter_number && `챕터 ${post.chapter_number}`}
                          {post.chapter_number && post.page_number && ' · '}
                          {post.page_number && `페이지 ${post.page_number}`}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="line-clamp-2 text-sm text-muted-foreground">
                    {post.content}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg">{selectedPost.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{new Date(selectedPost.created_at).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs text-muted-foreground">{selectedPost.author?.display_name || selectedPost.author?.email || '익명'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end min-w-[80px]">
                {(selectedPost.chapter_number || selectedPost.page_number) && (
                  <div className="text-base font-semibold text-primary mb-1">
                    {selectedPost.chapter_number && `챕터 ${selectedPost.chapter_number}`}
                    {selectedPost.chapter_number && selectedPost.page_number && ' · '}
                    {selectedPost.page_number && `페이지 ${selectedPost.page_number}`}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 whitespace-pre-line text-sm">{selectedPost.content}</div>
            <div className="mb-2 font-semibold">댓글</div>
            <Card className="mb-4">
              <CardContent className="space-y-3">
                {comments.length === 0 ? (
                  <div className="text-muted-foreground text-sm">아직 댓글이 없습니다.</div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                      <div className="text-xs text-muted-foreground mb-1">
                        {(c.author?.display_name || c.author?.email || '익명')} · {new Date(c.created_at).toLocaleString()}
                      </div>
                      <div className="text-sm">{c.content}</div>
                    </div>
                  ))
                )}
                <div className="flex gap-2 pt-2">
                  <Textarea
                    placeholder="댓글을 입력하세요"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    className="min-h-[40px]"
                  />
                  <Button onClick={handleComment}>댓글 등록</Button>
                </div>
              </CardContent>
            </Card>
            <Button variant="outline" className="mt-6" onClick={() => setSelectedPost(null)}>목록으로</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 