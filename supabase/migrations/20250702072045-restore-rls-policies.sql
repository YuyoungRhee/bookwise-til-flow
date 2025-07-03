-- Restore RLS policies with proper security
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_chapter_notes ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view books they created" ON public.shared_books;
DROP POLICY IF EXISTS "Users can create books" ON public.shared_books;
DROP POLICY IF EXISTS "Book creators can update their books" ON public.shared_books;
DROP POLICY IF EXISTS "Users can view books they are members of" ON public.shared_books;

DROP POLICY IF EXISTS "Users can view their own memberships" ON public.book_members;
DROP POLICY IF EXISTS "Users can join books" ON public.book_members;
DROP POLICY IF EXISTS "Users can leave books they joined" ON public.book_members;
DROP POLICY IF EXISTS "Users can view members of books they belong to" ON public.book_members;

DROP POLICY IF EXISTS "Users can view their own notes" ON public.shared_chapter_notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.shared_chapter_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.shared_chapter_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.shared_chapter_notes;
DROP POLICY IF EXISTS "Users can view notes from books they are members of" ON public.shared_chapter_notes;

-- Create new policies that avoid infinite recursion

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Shared books policies - only show books user created or is a member of
CREATE POLICY "Users can view their own created books" ON public.shared_books FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create books" ON public.shared_books FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Book creators can update their books" ON public.shared_books FOR UPDATE USING (auth.uid() = created_by);

-- Book members policies - simplified to avoid recursion
CREATE POLICY "Users can view their own memberships" ON public.book_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join books" ON public.book_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave books they joined" ON public.book_members FOR DELETE USING (auth.uid() = user_id);

-- Chapter notes policies - only show user's own notes
CREATE POLICY "Users can view their own notes" ON public.shared_chapter_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.shared_chapter_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.shared_chapter_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.shared_chapter_notes FOR DELETE USING (auth.uid() = user_id); 