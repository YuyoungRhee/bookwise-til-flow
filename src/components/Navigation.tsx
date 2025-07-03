import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Book, Calendar, Search, Edit, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/', label: '홈', icon: Book },
  { path: '/shared-books', label: '공유 책', icon: Users },
  { path: '/books', label: '개인 책', icon: Search },
  { path: '/wishlist', label: '위시리스트', icon: Book },
  { path: '/note-history', label: '기록 히스토리', icon: Edit },
  { path: '/settings', label: '설정', icon: Calendar },
];

export default function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

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
          
          <div className="flex items-center space-x-1">
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
            
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}