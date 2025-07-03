-- Fix shared chapter notes policies to allow viewing notes from books user is a member of
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own notes" ON public.shared_chapter_notes;

-- Create new policy that allows viewing notes from books user is a member of
CREATE POLICY "Users can view notes from books they are members of" ON public.shared_chapter_notes 
FOR SELECT USING (
  -- Allow if user is a member of the book
  EXISTS (
    SELECT 1 FROM public.book_members 
    WHERE book_id = shared_chapter_notes.book_id AND user_id = auth.uid()
  )
);

-- Keep existing policies for insert, update, delete
-- Users can only modify their own notes
CREATE POLICY "Users can create their own notes" ON public.shared_chapter_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.shared_chapter_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.shared_chapter_notes FOR DELETE USING (auth.uid() = user_id); 