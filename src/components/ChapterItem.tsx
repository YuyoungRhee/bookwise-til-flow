import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ChapterItemProps {
  number: number;
  title: string;
  isCompleted: boolean;
  isToday?: boolean;
  hasNotes?: boolean;
  onClick?: () => void;
}

export default function ChapterItem({
  number,
  title,
  isCompleted,
  isToday,
  hasNotes,
  onClick
}: ChapterItemProps) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:book-shadow cursor-pointer group",
      isCompleted && "bg-accent/10 border-accent/30",
      isToday && "ring-2 ring-primary ring-offset-2"
    )} onClick={onClick}>
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
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
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
          >
            {isCompleted ? "수정" : "학습하기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}