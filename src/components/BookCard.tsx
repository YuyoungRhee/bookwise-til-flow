import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface BookCardProps {
  title: string;
  author: string;
  cover?: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
  onClick?: () => void;
}

export default function BookCard({
  title,
  author,
  cover,
  progress,
  totalChapters,
  completedChapters,
  onClick
}: BookCardProps) {
  return (
    <Card 
      className="book-shadow hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          {cover ? (
            <img 
              src={cover} 
              alt={title}
              className="w-16 h-20 object-cover rounded border book-shadow"
            />
          ) : (
            <div className="w-16 h-20 bg-muted rounded border flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No Cover</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg group-hover:text-primary transition-colors study-text line-clamp-2">
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{author}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">진행률</span>
            <Badge variant="outline" className="text-xs">
              {completedChapters}/{totalChapters} 챕터
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="progress-fill" />
            <p className="text-xs text-muted-foreground text-right">
              {Math.round(progress)}% 완료
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}