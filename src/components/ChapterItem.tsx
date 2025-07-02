import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChapterItemProps {
  number: number;
  title: string;
  bookTitle?: string;
  isCompleted: boolean;
  isToday?: boolean;
  hasNotes?: boolean;
  onClick?: () => void;
}

export default function ChapterItem({
  number,
  title,
  bookTitle,
  isCompleted,
  isToday,
  hasNotes,
  onClick
}: ChapterItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (bookTitle) {
      // NoteWriting 페이지로 이동
      navigate(`/note-writing/${encodeURIComponent(bookTitle)}?chapter=${number}`);
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:book-shadow cursor-pointer group",
      isCompleted && "bg-accent/10 border-accent/30",
      isToday && "ring-2 ring-primary ring-offset-2"
    )} onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              isCompleted 
                ? "bg-accent text-accent-foreground" 
                : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
            )}>
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                number
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-medium study-text truncate",
                isCompleted && "text-muted-foreground line-through"
              )}>
                {bookTitle || title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {bookTitle && (
                  <p className="text-sm text-muted-foreground truncate">
                    {title}
                  </p>
                )}
                {isToday && (
                  <Badge variant="default" className="text-xs">
                    오늘 학습
                  </Badge>
                )}
                {hasNotes && (
                  <Badge variant="outline" className="text-xs">
                    기록 있음
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {isCompleted ? "수정" : "학습 기록하기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}