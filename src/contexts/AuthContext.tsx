import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });

    // 테스트용 공유 책 멤버십 자동 추가
    if (!error) {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          // 사용자 프로필 생성
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                user_id: user.id,
                display_name: displayName,
                email: email
              }
            ])
            .select();

          if (profileError && !profileError.message.includes('duplicate key')) {
            console.error('Profile creation error:', profileError);
          }

          // 테스트용 공유 책 멤버십 추가
          const { error: membershipError } = await supabase
            .from('book_members')
            .insert([
              {
                book_id: '08d9a283-2b3b-48c2-82c7-3f53458b5c8d',
                user_id: user.id
              }
            ])
            .select();

          if (membershipError && !membershipError.message.includes('duplicate key')) {
            console.error('Test book membership error:', membershipError);
          }
        }
      } catch (err) {
        console.error('Error adding test book membership:', err);
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}