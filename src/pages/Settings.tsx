import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [savedApiKey, setSavedApiKey] = useState('');

  const handleSaveApiKey = () => {
    // In real implementation, this would be saved to localStorage or backend
    setSavedApiKey(apiKey);
    localStorage.setItem('aladinApiKey', apiKey);
    console.log('API key saved:', apiKey);
  };

  const handleTestApiKey = async () => {
    if (!savedApiKey) {
      alert('먼저 API 키를 저장해주세요');
      return;
    }

    // Mock API test
    alert('API 키 테스트 성공! (실제 구현에서는 알라딘 API를 호출합니다)');
  };

  return (
    <>
      <Navigation />
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold study-text">설정</h1>
          <p className="text-muted-foreground">
            BookPlanner의 기본 설정을 관리하세요
          </p>
        </div>

        {/* Aladin API Key Section */}
        <Card className="book-shadow">
          <CardHeader>
            <CardTitle>알라딘 API 키 설정</CardTitle>
            <p className="text-sm text-muted-foreground">
              책 검색 기능을 사용하기 위해 알라딘 API 키가 필요합니다
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API 키</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="알라딘 API 키를 입력하세요"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSaveApiKey} disabled={!apiKey}>
                저장
              </Button>
              <Button variant="outline" onClick={handleTestApiKey}>
                연결 테스트
              </Button>
            </div>

            {savedApiKey && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  ✓ API 키가 저장되었습니다
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* API Information Section */}
        <Card className="book-shadow">
          <CardHeader>
            <CardTitle>알라딘 API 키 발급 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">1. 알라딘 API 신청</h4>
                <p className="text-muted-foreground ml-4">
                  알라딘 웹사이트에서 API 사용 신청을 합니다
                </p>
              </div>
              <div>
                <h4 className="font-medium">2. API 키 확인</h4>
                <p className="text-muted-foreground ml-4">
                  신청 승인 후 발급받은 TTBKey를 사용합니다
                </p>
              </div>
              <div>
                <h4 className="font-medium">3. API 사용 형태</h4>
                <p className="text-muted-foreground ml-4 font-mono text-xs bg-muted p-2 rounded">
                  http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey={'{'}알라딘ApiKey{'}'}&Query={'{'}검색어{'}'}&QueryType=Title&MaxResults=10&start=1&SearchTarget=Book&output=js&Version=20131101
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>참고:</strong> 알라딘 API는 무료로 제공되며, 하루 API 호출 횟수에 제한이 있을 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Study Preferences */}
        <Card className="book-shadow">
          <CardHeader>
            <CardTitle>학습 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>기본 하루 학습 목표</Label>
              <Input 
                type="number" 
                placeholder="2" 
                defaultValue="2"
              />
              <p className="text-xs text-muted-foreground">
                하루에 학습할 기본 챕터 수를 설정합니다
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>학습 알림</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">매일 학습 알림 받기</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">계획 기간 초과 시 알림</span>
                </label>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              설정 저장
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}