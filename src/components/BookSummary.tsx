import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, BookOpen, Calendar, Edit } from 'lucide-react';

interface BookRecord {
  chapterIndex: number;
  chapterTitle: string;
  content: string;
  updatedAt: string;
}

interface BookSummaryProps {
  bookTitle: string;
  onClose?: () => void;
}

export default function BookSummary({ bookTitle, onClose }: BookSummaryProps) {
  const [records, setRecords] = useState<BookRecord[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    // localStorage에서 해당 책의 모든 기록 가져오기
    const notes = JSON.parse(window.localStorage.getItem('chapterNotes') || '[]');
    const bookRecords = notes
      .filter((note: any) => note.bookTitle === bookTitle)
      .sort((a: any, b: any) => a.chapterIndex - b.chapterIndex);
    
    setRecords(bookRecords);
  }, [bookTitle]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;

      // 제목 추가
      pdf.setFontSize(20);
      pdf.text(`${bookTitle} 학습 기록`, 20, yPosition);
      yPosition += 20;

      pdf.setFontSize(12);
      pdf.text(`생성일: ${format(new Date(), 'yyyy년 M월 d일', { locale: ko })}`, 20, yPosition);
      yPosition += 20;

      // 각 챕터별 기록 추가
      for (const record of records) {
        // 새 페이지가 필요한지 확인
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        // 챕터 제목
        pdf.setFontSize(14);
        pdf.text(`${record.chapterTitle}`, 20, yPosition);
        yPosition += 15;

        // 날짜
        pdf.setFontSize(10);
        pdf.text(`기록일: ${format(new Date(record.updatedAt), 'yyyy-MM-dd', { locale: ko })}`, 20, yPosition);
        yPosition += 15;

        // 내용 (HTML 태그 제거)
        const cleanContent = record.content.replace(/<[^>]*>/g, '').substring(0, 500);
        pdf.setFontSize(10);
        const splitContent = pdf.splitTextToSize(cleanContent, 170);
        
        for (const line of splitContent) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, 20, yPosition);
          yPosition += 5;
        }
        
        yPosition += 10;
      }

      // PDF 다운로드
      pdf.save(`${bookTitle}_학습기록.pdf`);
    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const totalRecords = records.length;
  const firstRecord = records[0];
  const lastRecord = records[records.length - 1];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <BookOpen className="w-4 h-4 mr-2" />
          학습 기록 요약 보기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {bookTitle} 학습 기록 요약
            </span>
            <Button 
              onClick={generatePDF} 
              disabled={isGeneratingPDF}
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? 'PDF 생성중...' : 'PDF 다운로드'}
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 요약 통계 */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{totalRecords}</div>
                <div className="text-sm text-muted-foreground">완료한 챕터</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">
                  {firstRecord && lastRecord 
                    ? Math.ceil((new Date(lastRecord.updatedAt).getTime() - new Date(firstRecord.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">학습 기간 (일)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">
                  {totalRecords > 0 ? Math.round(records.reduce((sum, r) => sum + r.content.length, 0) / totalRecords) : 0}
                </div>
                <div className="text-sm text-muted-foreground">평균 기록 길이</div>
              </CardContent>
            </Card>
          </div>

          {/* 학습 기록 목록 */}
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4 pr-4">
              {records.map((record, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{record.chapterTitle}</CardTitle>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(record.updatedAt), 'M월 d일', { locale: ko })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-sm text-muted-foreground line-clamp-3"
                      dangerouslySetInnerHTML={{ 
                        __html: record.content.substring(0, 200) + (record.content.length > 200 ? '...' : '')
                      }}
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      <Edit className="w-3 h-3 inline mr-1" />
                      기록 길이: {record.content.replace(/<[^>]*>/g, '').length}자
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {records.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  아직 작성된 학습 기록이 없습니다.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}