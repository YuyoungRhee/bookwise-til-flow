-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shared books table
CREATE TABLE public.shared_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  total_chapters INTEGER DEFAULT 0,
  pages INTEGER,
  chapters TEXT[],
  parts JSONB,
  invite_code TEXT UNIQUE NOT NULL DEFAULT SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create book members table
CREATE TABLE public.book_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.shared_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_id, user_id)
);

-- Create shared chapter notes table
CREATE TABLE public.shared_chapter_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.shared_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_chapter_notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Shared books policies
CREATE POLICY "Users can view books they are members of" ON public.shared_books FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.book_members 
    WHERE book_id = id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create books" ON public.shared_books FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Book creators can update their books" ON public.shared_books FOR UPDATE USING (auth.uid() = created_by);

-- Book members policies
CREATE POLICY "Users can view members of books they belong to" ON public.book_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.book_members bm 
    WHERE bm.book_id = book_id AND bm.user_id = auth.uid()
  )
);
CREATE POLICY "Users can join books" ON public.book_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave books they joined" ON public.book_members FOR DELETE USING (auth.uid() = user_id);

-- Chapter notes policies
CREATE POLICY "Users can view notes from books they are members of" ON public.shared_chapter_notes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.book_members 
    WHERE book_id = shared_chapter_notes.book_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create their own notes" ON public.shared_chapter_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.shared_chapter_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.shared_chapter_notes FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shared_books_updated_at
  BEFORE UPDATE ON public.shared_books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shared_chapter_notes_updated_at
  BEFORE UPDATE ON public.shared_chapter_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();