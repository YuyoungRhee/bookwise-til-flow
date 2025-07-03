-- Temporarily disable RLS to fix infinite recursion issue
-- This is a temporary solution for development

-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_chapter_notes DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
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