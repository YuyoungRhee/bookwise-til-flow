-- Fix RLS policies to prevent infinite recursion
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of books they belong to" ON public.book_members;
DROP POLICY IF EXISTS "Users can view books they are members of" ON public.shared_books;
DROP POLICY IF EXISTS "Users can view notes from books they are members of" ON public.shared_chapter_notes;

-- Create simplified policies that don't cause recursion
-- Book members policies
CREATE POLICY "Users can view their own memberships" ON public.book_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join books" ON public.book_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave books they joined" ON public.book_members FOR DELETE USING (auth.uid() = user_id);

-- Shared books policies - simplified to avoid recursion
CREATE POLICY "Users can view books they created" ON public.shared_books FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create books" ON public.shared_books FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Book creators can update their books" ON public.shared_books FOR UPDATE USING (auth.uid() = created_by);

-- Chapter notes policies - simplified
CREATE POLICY "Users can view their own notes" ON public.shared_chapter_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.shared_chapter_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.shared_chapter_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.shared_chapter_notes FOR DELETE USING (auth.uid() = user_id); 