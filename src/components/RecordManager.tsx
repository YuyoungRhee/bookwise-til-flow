import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Record {
  id: number;
  chapter: string;
  date: string;
  content: string;
}

export default function RecordManager() {
  const [records, setRecords] = useState<Record[]>([
    { id: 1, chapter: '1장: 시작하기', date: '2024-07-01', content: '핵심 개념 정리' },
    { id: 2, chapter: '2장: 기초 다지기', date: '2024-07-02', content: '예제 코드 실습' },
  ]);
  const [newRecord, setNewRecord] = useState({ chapter: '', date: '', content: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const addRecord = () => {
    if (!newRecord.chapter || !newRecord.date || !newRecord.content) return;
    setRecords([
      ...records,
      { id: Date.now(), ...newRecord }
    ]);
    setNewRecord({ chapter: '', date: '', content: '' });
  };
  const startEdit = (id: number, content: string) => {
    setEditId(id);
    setEditContent(content);
  };
  const saveEdit = (id: number) => {
    setRecords(records.map(r => r.id === id ? { ...r, content: editContent } : r));
    setEditId(null);
    setEditContent('');
  };
  const deleteRecord = (id: number) => {
    setRecords(records.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>기록 작성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="챕터명"
              value={newRecord.chapter}
              onChange={e => setNewRecord({ ...newRecord, chapter: e.target.value })}
              className="w-40"
            />
            <Input
              type="date"
              value={newRecord.date}
              onChange={e => setNewRecord({ ...newRecord, date: e.target.value })}
              className="w-32"
            />
            <Textarea
              placeholder="학습 내용"
              value={newRecord.content}
              onChange={e => setNewRecord({ ...newRecord, content: e.target.value })}
              className="w-64"
            />
            <Button onClick={addRecord}>추가</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>히스토리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {records.map(r => (
            <div key={r.id} className="flex items-center gap-2 border-b py-2">
              <span className="w-40">{r.chapter}</span>
              <span className="w-32">{r.date}</span>
              {editId === r.id ? (
                <>
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-64"
                  />
                  <Button size="sm" onClick={() => saveEdit(r.id)}>저장</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditId(null)}>취소</Button>
                </>
              ) : (
                <>
                  <span className="w-64">{r.content}</span>
                  <Button size="sm" variant="outline" onClick={() => startEdit(r.id, r.content)}>수정</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteRecord(r.id)}>삭제</Button>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 