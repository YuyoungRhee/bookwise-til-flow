import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Navigation from '@/components/Navigation';

export default function BookCompletedRecords() {
  const { bookId } = useParams();
  const [records, setRecords] = useState<any[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);

  useEffect(() => {
    if (!bookId) return;
    const books = JSON.parse(window.localStorage.getItem('dashboardBooks') || '[]');
    const book = books.find((b: any) => decodeURIComponent(bookId) === b.title);
    setChapters(book?.chapters || []);
    const notes = JSON.parse(window.localStorage.getItem('chapterNotes') || '[]');
    const filtered = notes.filter((n: any) => n.bookTitle === book.title);
    // 챕터 인덱스 순으로 정렬
    filtered.sort((a: any, b: any) => a.chapterIndex - b.chapterIndex);
    setRecords(filtered);
  }, [bookId]);

  const handleExportPDF = async () => {
    const element = document.getElementById('records-content');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    // 여러 페이지 분할 처리
    let remainingHeight = pdfHeight;
    while (remainingHeight > pageHeight) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      remainingHeight -= pageHeight;
    }
    pdf.save(`${bookId}-기록.pdf`);
  };

  return (
    <>
      <Navigation />
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">기록 한 눈에 보기</h1>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="px-3 py-2 rounded bg-primary text-white text-sm">PDF로 저장</button>
            <Link to="/completed-books">
              <Button variant="outline">완료한 책 목록</Button>
            </Link>
          </div>
        </div>
        <div id="records-content">
        {chapters.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            챕터 정보가 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {chapters.map((ch, idx) => {
              const rec = records.find((r: any) => Number(r.chapterIndex) === idx);
              return (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{ch}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {rec ? (
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: rec.content }} />
                    ) : (
                      <div className="text-muted-foreground">기록 없음</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </>
  );
} 