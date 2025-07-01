import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Book, Calendar, Search, Edit } from 'lucide-react';

const navItems = [
  { path: '/', label: '대시보드', icon: Book },
  { path: '/search', label: '책 검색', icon: Search },
  { path: '/plan', label: '학습 계획', icon: Calendar },
  { path: '/notes', label: '학습 기록', icon: Edit },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-card border-b border-border book-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground study-text">
                BookPlanner
              </span>
            </Link>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}