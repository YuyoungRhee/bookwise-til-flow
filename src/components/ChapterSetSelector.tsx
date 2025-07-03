import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Users, ThumbsUp } from 'lucide-react';
import { useChapterSets, ChapterSet, BookInfo } from '@/hooks/useChapterSets';
import { formatChapterList } from '@/utils/chapterUtils';
import { useAuth } from '@/contexts/AuthContext';

interface ChapterSetSelectorProps {
  bookInfo: BookInfo;
  onChapterSelected: (chapters: string[]) => void;
  onNext: () => void;
}

export default function ChapterSetSelector({ bookInfo, onChapterSelected, onNext }: ChapterSetSelectorProps) {
  const [chapterSets, setChapterSets] = useState<ChapterSet[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [expandedSet, setExpandedSet] = useState<string | null>(null);
  const { user } = useAuth();
  const { loading, getChapterSets, saveOrUpdateChapterSet } = useChapterSets();

  useEffect(() => {
    loadChapterSets();
  }, [bookInfo.id]);

  const loadChapterSets = async () => {
    const sets = await getChapterSets(bookInfo.id);
    setChapterSets(sets);
  };

  const handleSelectExisting = async (chapterSet: ChapterSet) => {
    if (!user) return;
    
    // 선택수 증가
    await saveOrUpdateChapterSet(bookInfo.id, chapterSet.original_input, user.id);
    
    // 선택된 챕터를 부모에 전달
    const chapters = Array.isArray(chapterSet.chapter_list_json) 
      ? chapterSet.chapter_list_json 
      : [];
    onChapterSelected(chapters);
    onNext();
  };

  const handleSaveCustom = async () => {
    if (!user || !customInput.trim()) return;
    
    const success = await saveOrUpdateChapterSet(bookInfo.id, customInput, user.id);
    if (success) {
      const chapters = customInput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      onChapterSelected(chapters);
      onNext();
    }
  };

  const toggleExpanded = (setId: string) => {
    setExpandedSet(expandedSet === setId ? null : setId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>챕터 목록 선택</CardTitle>
          <p className="text-sm text-muted-foreground">
            다른 사용자들이 입력한 챕터 목록 중에서 선택하거나, 직접 입력하세요.
          </p>
        </CardHeader>
      </Card>

      {/* 기존 챕터 목록들 */}
      {chapterSets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              추천 챕터 목록 ({chapterSets.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chapterSets.map((set) => (
              <div key={set.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {set.selection_count}명 선택
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {Array.isArray(set.chapter_list_json) ? set.chapter_list_json.length : 0}개 챕터
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(set.id)}
                    >
                      {expandedSet === set.id ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          접기
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          상세보기
                        </>
                      )}
                    </Button>
                    <Button onClick={() => handleSelectExisting(set)} disabled={loading}>
                      이 목록 선택
                    </Button>
                  </div>
                </div>

                {expandedSet === set.id && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <div className="font-medium mb-2">챕터 목록:</div>
                      <div className="bg-muted p-3 rounded text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {Array.isArray(set.chapter_list_json) 
                          ? formatChapterList(set.chapter_list_json)
                          : set.original_input
                        }
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 직접 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>직접 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCustomInput ? (
            <Button 
              variant="outline" 
              onClick={() => setShowCustomInput(true)}
              className="w-full"
            >
              새로운 챕터 목록 입력하기
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  챕터 목록 (한 줄에 하나씩 입력)
                </label>
                <Textarea
                  placeholder={`예:\n1장. 자바 시작하기\n2장. 변수와 타입\n3장. 연산자\n...`}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveCustom} disabled={loading || !customInput.trim()}>
                  {loading ? '저장 중...' : '저장하고 다음 단계'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomInput('');
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}